<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;

class InventoryManagementController extends Controller
{
    public function index()
    {
        $managerId = auth('manager')->id();

        $items = InventoryItem::where('manager_id', $managerId)
            ->with('menuInventoryItems')
            ->get();

        return response()->json([
            'status' => true,
            'inventory_items' => $items,
        ]);
    }
    //    ................................................................................................................................................

    public function show($id)
    {
        try {
            $managerId = auth('manager')->id();

            $item = InventoryItem::where('manager_id', $managerId)
                ->with('menuInventoryItems')
                ->findOrFail($id);

            return response()->json([
                'status' => true,
                'item' => $item,
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Inventory item not found.',
            ], 404);
        }
    }
    //    ................................................................................................................................................

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'quantity' => 'required|integer|min:0',
            'unit' => 'required|string',
            'expiry_date' => 'required|date',
            'threshold_level' => 'required|integer|min:0',
        ]);

        $data['manager_id'] = auth('manager')->id();

        $item = InventoryItem::create($data);

        return response()->json([
            'status' => true,
            'message' => 'Inventory item created successfully.',
            'item' => $item,
        ], 201);
    }
    //    ................................................................................................................................................

    public function update(Request $request, $id)
    {
        $item = InventoryItem::where('manager_id', auth('manager')->id())->findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|required|string',
            'quantity' => 'sometimes|required|integer|min:0',
            'unit' => 'sometimes|required|string',
            'expiry_date' => 'sometimes|required|date',
            'threshold_level' => 'sometimes|required|integer|min:0',
        ]);

        $item->update($data);

        return response()->json([
            'status' => true,
            'message' => 'Inventory item updated successfully.',
            'item' => $item,
        ]);
    }
    //    ................................................................................................................................................

    public function destroy($id)
    {
        $item = InventoryItem::where('manager_id', auth('manager')->id())->findOrFail($id);

        if ($item->menuInventoryItems()->count() > 0) {
            return response()->json([
                'status' => false,
                'message' => 'Cannot delete this item because it is linked to active menu items.',
            ], 403);
        }

        $item->delete();

        return response()->json([
            'status' => true,
            'message' => 'Inventory item deleted successfully.',
        ]);
    }
}
