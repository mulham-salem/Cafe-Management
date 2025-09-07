<?php

namespace App\Http\Controllers;

use App\Models\Table;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TableManagementController extends Controller
{
    /**
     * Display a listing of all tables with their associated employee.
     */
    public function index(): JsonResponse
    {
        $tables = Table::with('employee')
            ->select('id', 'number', 'status', 'capacity', 'x', 'y')
            ->get();

        return response()->json(['tables' => $tables]);
    }

    /**
     * Store a newly created table in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'number' => 'required|string|unique:tables,number',
            'capacity' => 'required|integer|min:1',
            'status' => 'required|in:available,reserved,cleaning',
        ]);

        if ($validator->fails()) {
            $errors = $validator->errors();
            if ($errors->has('number') && $errors->first('number') === 'The number has already been taken.') {
                return response()->json(['message' => 'Table already exists'], 409);
            }

            return response()->json(['errors' => $errors], 422);
        }

        $data = $validator->validated();
        $data['employee_id'] = auth('user')->id();

        $table = Table::create($data);

        return response()->json(['message' => 'Table created successfully', 'table' => $table], 201);
    }

    /**
     * Update the specified table's status in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $table = Table::find($id);

        if (! $table) {
            return response()->json(['message' => 'Table not found'], 404);
        }

        // السماح بتعديل status, x, y
        $validated = $request->validate([
            'status' => 'nullable|in:available,reserved,cleaning',
            'x'      => 'nullable|numeric|min:0',
            'y'      => 'nullable|numeric|min:0',
            'confirm'=> 'nullable|boolean',
        ]);

        // إذا كان الطلب تعديل إحداثيات بس بدون status
        if (!isset($validated['status'])) {
            $table->fill([
                'x' => $validated['x'] ?? $table->x,
                'y' => $validated['y'] ?? $table->y,
            ])->save();

            return response()->json([
                'message' => 'Table position updated successfully',
                'table'   => $table,
            ]);
        }

        // إذا فيه تعديل status
        $newStatus = $validated['status'];
        $currentStatus = $table->status;

        $allowedTransitions = [
            'available' => ['reserved'],
            'reserved'  => ['cleaning'],
            'cleaning'  => ['available'],
        ];

        if (! in_array($newStatus, $allowedTransitions[$currentStatus] ?? [])) {
            return response()->json([
                'message' => 'Invalid status transition.',
            ], 422);
        }

        if ($currentStatus === 'reserved' && $newStatus === 'cleaning' && ! $request->boolean('confirm')) {
            return response()->json([
                'message' => 'This table is currently reserved.',
            ], 409);
        }

        $table->status = $newStatus;
        $table->x = $validated['x'] ?? $table->x;
        $table->y = $validated['y'] ?? $table->y;
        $table->save();

        return response()->json([
            'message' => 'Table status updated successfully',
            'table'   => $table,
        ]);
    }

    /**
     * Remove the specified table from storage.
     *
     * @param  mixed  $id
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $table = Table::with('reservations')->find($id);

        if (! $table) {
            return response()->json(['message' => 'Table not found'], 404);
        }

        $hasActiveReservations = $table->reservations()->where('status', 'active')->exists();

        if ($table->status === 'reserved' && ! $request->boolean('confirm')) {
            return response()->json([
                'message' => 'This table is currently reserved, Are you sure you want to proceed?',
            ], 409);
        }

        if ($hasActiveReservations && ! $request->boolean('confirm')) {
            return response()->json([
                'message' => 'This table is currently reserved, Are you sure you want to proceed?',
            ], 409);
        }

        $table->delete();

        return response()->json(['message' => 'Table deleted successfully']);
    }

    /**
     * Display the specified table with its associated employee.
     */
    public function show(string $id): JsonResponse
    {
        $table = Table::with('employee')->find($id);

        if (! $table) {
            return response()->json(['message' => 'Table not found'], 404);
        }

        return response()->json(['table' => $table]);
    }

}
