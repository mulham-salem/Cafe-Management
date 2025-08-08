<?php

namespace App\Http\Controllers;

use App\Models\Table;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TableManagementController extends Controller
{
    /**
     * Display a listing of all tables with their associated manager.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $tables = Table::with('manager')->get();

        return response()->json(['tables' => $tables]);
    }

    /**
     * Store a newly created table in storage.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'number' => 'required|integer|unique:tables,number',
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
        $data['manager_id'] = auth('manager')->id();

        $table = Table::create($data);

        return response()->json(['message' => 'Table created successfully', 'table' => $table], 201);
    }

    /**
     * Display the specified table with its associated manager.
     *
     * @param  string  $id
     * @return JsonResponse
     */
    public function show(string $id): JsonResponse
    {
        $table = Table::with('manager')->find($id);

        if (! $table) {
            return response()->json(['message' => 'Table not found'], 404);
        }

        return response()->json(['table' => $table]);
    }

    /**
     * Update the specified table's status in storage.
     *
     * @param Request $request
     * @param  string  $id
     * @return JsonResponse
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $table = Table::find($id);

        if (! $table) {
            return response()->json(['message' => 'Table not found'], 404);
        }

        $validated = $request->validate([
            'status' => 'required|in:available,reserved,cleaning',
            'confirm' => 'nullable|boolean',
        ]);

        $newStatus = $validated['status'];
        $currentStatus = $table->status;

        $allowedTransitions = [
            'available' => ['reserved'],
            'reserved' => ['cleaning'],
            'cleaning' => ['available'],
        ];

        if ( ! in_array($newStatus, $allowedTransitions[$currentStatus] ?? []) ) {
            return response()->json([
                'message' => 'Invalid status transition.',
            ], 422);
        }

        if ($currentStatus === 'reserved' && $newStatus === 'cleaning' && ! $request->boolean('confirm')) {
            return response()->json([
                'message' => 'This table is currently reserved.' //'Are you sure you want to update status?',
            ], 409);
        }

        $table->status = $newStatus;
        $table->save();

        return response()->json(['message' => 'Table status updated successfully', 'table' => $table]);
    }

    /**
     * Remove the specified table from storage.
     *
     * @param Request $request
     * @param  mixed  $id
     * @return JsonResponse
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
}
