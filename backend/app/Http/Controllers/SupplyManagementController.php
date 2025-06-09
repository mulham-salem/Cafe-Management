<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\Notification;
use App\Models\PurchaseBill;
use App\Models\SupplyOffer;
use App\Models\SupplyRequest;
use App\Models\SupplyRequestItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplyManagementController extends Controller
{
    public function index()
    {
        $offers = SupplyOffer::with([
            'supplier.user',
            'supplyOfferItems.inventoryItem',
        ])->where('status', 'pending')->orderByDesc('created_at')->get();

        $data = $offers->map(function ($offer) {
            return [
                'id' => $offer->id,
                'title' => $offer->title,
                'supplier_name' => $offer->supplier->user->name ?? 'Unknown',
                'total_price' => $offer->total_price,
                'delivery_date' => $offer->delivery_date->toDateTimeString(),
                'note' => $offer->note,
                'items' => $offer->supplyOfferItems->map(function ($item) {
                    return [
                        'item_name' => $item->inventoryItem->name,
                        'quantity' => $item->quantity,
                        'unit' => $item->inventoryItem->unit,
                        'unit_price' => $item->unit_price,
                    ];
                }),
            ];
        });

        return response()->json($data);
    }
    //    ................................................................................................................................................

    public function acceptOffer($id)
    {
        $supplyOffer = SupplyOffer::with('supplier.user', 'supplyOfferItems.inventoryItem')->findOrFail($id);

        if ($supplyOffer->status !== 'pending') {
            return response()->json(['message' => 'This offer has already been processed.'], 400);
        }

        $supplyOffer->status = 'accepted';
        $supplyOffer->save();
        foreach ($supplyOffer->supplyOfferItems as $item) {
            $inventoryItem = $item->inventoryItem;

            if ($inventoryItem) {
                $inventoryItem->quantity += $item->quantity;
                $inventoryItem->save();
            } else {
               $newInventoryItem= InventoryItem::create([
                    'manager_id'=>auth('manager')->user()->id,
                    'name' => $item->name ?? 'Unnamed Item',
                    'quantity' => $item->quantity,
                    'unit'=>$item->unit_price,
                    'note' => 'Added automatically from supply offer #'.$supplyOffer->id,
                   
                ]);
                $item->inventoryitem_id = $newInventoryItem->id;
                $item->save();
            }

        }
        Notification::create([
            'manager_id' => auth('manager')->user()->id,
            'user_id' => $supplyOffer->supplier->user->id,
            'message' => "Offer has been accepted '{$supplyOffer->title}'",
            'createdAt' => now(),
            'seen' => false,
        ]);
        

        return response()->json(['message' => 'Supply offer accepted and inventory updated successfully.']);
    }
    //    ................................................................................................................................................

    public function rejectOffer(Request $request, $id)
    {
        $supplyOffer = SupplyOffer::with('supplier.user', 'supplyOfferItems.inventoryItem')->findOrFail($id);

        $request->validate([
            'reason' => 'nullable|string|max:1000',
        ]);

        $offer = SupplyOffer::findOrFail($id);

        if ($offer->status !== 'pending') {
            return response()->json(['message' => 'This offer has already been processed.'], 400);
        }

        $offer->status = 'rejected';
        $offer->note = $request->note ?? 'Rejected without reason';
        $offer->save();

        Notification::create([
            'manager_id' => auth('manager')->user()->id,
            'user_id' => $supplyOffer->supplier->user->id,
            'message' => "Offer has been rejected '{$supplyOffer->title}'. note: {$supplyOffer->note}",
            'createdAt' => now(),
            'seen' => false,
        ]);

        return response()->json(['message' => 'Supply offer rejected successfully.']);
    }
    //    ................................................................................................................................................

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:users,id',
            'note' => 'nullable|string',
            'items' => 'required|array',
            'items.*.inventoryItem_id' => 'required|exists:inventory_items,id',
            'items.*.quantity' => 'required|integer|min:0',
        ]);

        $validItems = collect($validated['items'])->filter(function ($item) {
            return $item['quantity'] > 0;
        });

        if ($validItems->isEmpty()) {
            return response()->json([
                'message' => 'Please enter quantity for at least one item.',
            ], 422);
        }

        $supplyRequest = SupplyRequest::create([
            'manager_id' => auth('manager')->id(),
            'note' => $validated['note'],
            'request_date' => now(),
            'status' => 'pending',
        ]);

        foreach ($validItems as $item) {
            SupplyRequestItem::create([
                'supplyRequest_id' => $supplyRequest->id,
                'inventoryItem_id' => $item['inventoryItem_id'],
                'quantity' => $item['quantity'],
            ]);
        }

        Notification::create([
            'manager_id' => auth('manager')->id(),
            'user_id' => $validated['supplier_id'],
            'message' => 'You have received a new supply request: ',
            'createdAt' => now(),
            'seen' => false,
        ]);

        return response()->json([
            'message' => 'Supply request sent successfully.',
            'supply_request_id' => $supplyRequest->id,
        ]);
    }

    //    ................................................................................................................................................
    public function storePurchaseBill(Request $request)
    {
        $request->validate([
            'supplyOffer_id' => 'required|exists:supply_offers,id',
            'supplier_id' => 'required|exists:suppliers,id',
            'purchase_date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        $totalAmount = 0;

        foreach ($request->items as $item) {
            $totalAmount += $item['quantity'] * $item['unit_price'];
        }

        $purchaseBill = PurchaseBill::create([
            'manager_id' => auth('manager')->user()->id,
            'supplyOffer_id' => $request->supplyOffer_id,
            'supplier_id' => $request->supplier_id,
            'total_amount' => $totalAmount,
            'purchase_date' => $request->purchase_date,

        ]);
        // this is the ingriedents of the products which are storing in the inventory after we payed by purchaceBill
        foreach ($request->items as $item) {
            $purchaseBill->items()->create([
                'inventory_item_id' => $item['inventory_item_id'],
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
            ]);

            $inventoryItem = InventoryItem::find($item['inventory_item_id']);
            $inventoryItem->quantity += $item['quantity'];
            $inventoryItem->save();
        }

        return response()->json([
            'message' => 'Purchase bill created successfully',
            'purchase_bill' => $purchaseBill,
        ], 201);
    }

    public function show(string $id) {}

    public function update(Request $request, string $id) {}

    public function destroy(string $id) {}
}
