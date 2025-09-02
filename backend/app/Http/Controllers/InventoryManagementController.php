<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\Notification;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventoryManagementController extends Controller
{
    /**
     * Display a listing of the inventory items for the authenticated manager.
     *
     * @return JsonResponse
     */
    public function index()
    {
        $managerId = auth('manager')->id();

        $items = InventoryItem::where('manager_id', $managerId)->get();

        return response()->json(['inventory_items' => $items]);
    }

    /**
     * Checks for low stock and creates a notification if necessary.
     * Returns the low stock message if a new notification was created, otherwise null.
     */
    protected function checkAndCreateLowStockNotification(InventoryItem $item): ?string
    {
        if ($item->quantity <= $item->threshold_level) {
            $managerId = auth('manager')->id();
            $message = "{$item->name} only has {$item->quantity} {$item->unit} left.\n(threshold: {$item->threshold_level} {$item->unit}).";

            $existingNotification = Notification::where('manager_id', $managerId)
                ->where('purpose', 'Low Stock Alert')
                ->where('message', $message)
                ->where('seen', false)
                ->first();

            if (! $existingNotification) {

                Notification::create([
                    'manager_id' => $managerId,
                    'sent_by' => 'system',
                    'purpose' => 'Low Stock Alert',
                    'message' => $message,
                    'createdAt' => Carbon::now(),
                    'seen' => false,
                ]);

                return $message;
            }
        }

        return null;
    }

    /**
     * Display the specified inventory item for the authenticated manager.
     *
     * @param  int  $id
     * @return JsonResponse
     */
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
                'message' => 'Inventory item not found.',
            ], 404);
        }
    }

    /**
     * Store a newly created inventory item in storage.
     *
     * @return JsonResponse
     */
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

        // استدعاء دالة التنبيه بعد إنشاء العنصر
        $lowStockMessage = $this->checkAndCreateLowStockNotification($item);

        $response = [
            'message' => 'Inventory item created successfully.',
            'item' => $item,
        ];

        if ($lowStockMessage) {
            $response['low_stock_alert'] = $lowStockMessage; // إضافة رسالة التنبيه إلى الاستجابة
        }

        return response()->json($response, 201);
    }

    /**
     * Update the specified inventory item in storage.
     *
     * @param  int  $id
     * @return JsonResponse
     */
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

        // استدعاء دالة التنبيه بعد تحديث العنصر
        $lowStockMessage = $this->checkAndCreateLowStockNotification($item);

        $response = [
            'message' => 'Inventory item updated successfully.',
            'item' => $item,
        ];

        if ($lowStockMessage) {
            $response['low_stock_alert'] = $lowStockMessage; // إضافة رسالة التنبيه إلى الاستجابة
        }

        return response()->json($response);
    }

    /**
     * Remove the specified inventory item from storage.
     *
     * @param  int  $id
     * @return JsonResponse
     */
    public function destroy($id)
    {
        $item = InventoryItem::where('manager_id', auth('manager')->id())->findOrFail($id);

        //        if ($item->menuInventoryItems()->count() > 0) {
        //            return response()->json([
        //                'status' => false,
        //                'message' => 'Cannot delete this item because it is linked to active menu items.',
        //            ], 403);
        //        }

        $item->delete();

        return response()->json([
            'status' => true,
            'message' => 'Inventory item deleted successfully.',
        ]);
    }
}
