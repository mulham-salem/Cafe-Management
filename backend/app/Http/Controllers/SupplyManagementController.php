<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\Notification;
use App\Models\PurchaseBill;
use App\Models\SupplyOffer;
use App\Models\SupplyRequest;
use App\Models\SupplyRequestItem;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplyManagementController extends Controller
{
    /**
     * Display a listing of supply offers with their related data.
     *
     * @return JsonResponse
     */
    public function index()
    {
        $offers = SupplyOffer::with([
            'supplier.user',
            'supplyOfferItems.inventoryItem',
        ])->orderByDesc('created_at')->get();

        $data = $offers->map(function ($offer) {
            return [
                'id' => $offer->id,
                'title' => $offer->title,
                'supplier_name' => $offer->supplier->user->name ?? 'Unknown',
                'total_price' => $offer->total_price,
                'delivery_date' => $offer->delivery_date->toDateTimeString(),
                'note' => $offer->note,
                'status' => $offer->status,
                'items' => $offer->supplyOfferItems->map(function ($item) {
                    $itemName = $item->inventoryItem->name ?? $item->name;
                    $itemUnit = $item->inventoryItem->unit ?? $item->unit;
                    return [
                        'item_name' => $itemName,
                        'quantity' => $item->quantity,
                        'unit' => $itemUnit,
                        'unit_price' => $item->unit_price,
                    ];
                }),
            ];
        });

        return response()->json($data);
    }

    /**
     * Get a list of suppliers associated with the authenticated manager.
     *
     * @return JsonResponse
     */
    public function getSuppliers(): JsonResponse
    {
        $managerId = auth('manager')->id();

        // جلب الموردين الذين أنشأهم هذا المدير والمرتبطين بجدول users
        $suppliers = User::where('role', 'supplier')
            ->where('manager_id', $managerId)
            ->select('id', 'name')
            ->get();

        return response()->json($suppliers);
    }

    /**
     * Accept a pending supply offer.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function acceptOffer($id)
    {
        $supplyOffer = SupplyOffer::with('supplier.user', 'supplyOfferItems.inventoryItem')->findOrFail($id);

        if ($supplyOffer->status !== 'pending') {
            return response()->json(['message' => 'This offer has already been processed.'], 400);
        }

        $supplyOffer->status = 'accepted';
        $supplyOffer->save();

        Notification::create([
            'manager_id' => auth('manager')->user()->id,
            'user_id' => $supplyOffer->supplier_id,
            'sent_by' => 'manager',
            'purpose' => 'Supply Offer Response',
            'message' => "'{$supplyOffer->title}' Offer has been accepted",
            'createdAt' => now(),
            'seen' => false,
        ]);

        return response()->json(['message' => 'Supply offer accepted and waiting to pay the bill.']);
    }

    /**
     * Reject a pending supply offer.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function rejectOffer(Request $request, $id)
    {
        $supplyOffer = SupplyOffer::with('supplier.user', 'supplyOfferItems.inventoryItem')->findOrFail($id);

        $request->validate([
            'reason' => 'nullable|string|max:1000',
        ]);

        if ($supplyOffer->status !== 'pending') {
            return response()->json(['message' => 'This offer has already been processed.'], 400);
        }

        $supplyOffer->status = 'rejected';
        $supplyOffer->rejection_reason = $request->reason ?? 'Rejected without reason';
        $supplyOffer->save();

        Notification::create([
            'manager_id' => auth('manager')->user()->id,
            'user_id' => $supplyOffer->supplier_id,
            'sent_by' => 'manager',
            'purpose' => 'Supply Offer Response',
            'message' => "Offer '{$supplyOffer->title}' has been rejected\nReason: {$supplyOffer->rejection_reason}",
            'createdAt' => now(),
            'seen' => false,
        ]);

        return response()->json(['message' => 'Supply offer rejected successfully.']);
    }

    /**
     * Store a new supply request.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:users,id',
            'title' => 'required|string',
            'note' => 'nullable|string',
            'items' => 'required|array',
            'items.*.inventory_item_id' => 'required|exists:inventory_items,id',
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
            'title' => $validated['title'],
            'note' => $validated['note'],
            'request_date' => now(),
            'status' => 'pending',
        ]);

        foreach ($validItems as $item) {
            SupplyRequestItem::create([
                'supplyRequest_id' => $supplyRequest->id,
                'inventory_item_id' => $item['inventory_item_id'],
                'quantity' => $item['quantity'],
            ]);
        }

        Notification::create([
            'manager_id' => auth('manager')->id(),
            'user_id' => $validated['supplier_id'],
            'supplyRequest_id' => $supplyRequest->id,
            'sent_by' => 'manager',
            'purpose' => 'Supply Request',
            'message' => "You have received a new supply request: '{$supplyRequest->title}'",
            'createdAt' => now(),
            'seen' => false,
        ]);

        return response()->json([
            'message' => 'Supply request sent successfully.',
            'supply_request_id' => $supplyRequest->id,
        ]);
    }

    /**
     * Store a new purchase bill and update inventory based on an accepted supply offer.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function storePurchaseBill(Request $request)
    {
        $request->validate([
            'supply_offer_id' => 'required|exists:supply_offers,id',
            'supplier_id' => 'required|exists:suppliers,id',
            'purchase_date' => 'required|date',
            'unit_price' => 'nullable|string',
        ]);

        $supplyOffer = SupplyOffer::with('supplyOfferItems.inventoryItem')->findOrFail($request->supply_offer_id);

        $existingPurchaseBill = PurchaseBill::where('supply_offer_id', $request->supply_offer_id)->first();
        if ($existingPurchaseBill) {
            return response()->json(['message' => 'A purchase bill already exists for this supply offer.'], 409); // 409 Conflict
        }

        $totalAmount = $supplyOffer->supplyOfferItems->sum('total_price');

        $purchaseBill = PurchaseBill::create([
            'manager_id' => auth('manager')->user()->id,
            'supply_offer_id' => $request->supply_offer_id,
            'supplier_id' => $request->supplier_id,
            'total_amount' => $totalAmount,
            'purchase_date' => $request->purchase_date,
            'unit_price' => $request->item_calculated_prices,
        ]);

        foreach ($supplyOffer->SupplyOfferItems as $offerItem) {
            $inventoryItem = null;

            if ($offerItem->inventory_item_id) {
                $inventoryItem = InventoryItem::find($offerItem->inventory_item_id);
            }

            if (! $inventoryItem) {
                $inventoryItem = InventoryItem::where('name', $offerItem->name)
                    ->where('unit', $offerItem->unit)
                    ->first();
            }

            if ($inventoryItem) {
                $inventoryItem->quantity += $offerItem->quantity;
                $inventoryItem->save();
            } else {
                $inventoryItem = InventoryItem::create([
                    'manager_id' => auth('manager')->user()->id,
                    'name' => $offerItem->name,
                    'quantity' => $offerItem->quantity,
                    'unit' => $offerItem->unit,
                    'note' => 'Added automatically from supply offer #'.$supplyOffer->id,
                    'purchaseBill_id' => $purchaseBill->id,
                ]);

            }

            $offerItem->inventory_item_id = $inventoryItem->id;
            $offerItem->save();
        }

        return response()->json([
            'message' => 'Purchase Bill Saved and Inventory Updated!.',
            'purchase_bill_id' => $purchaseBill->id,
            'purchase_bill' => $purchaseBill,
        ], 201);
    }


    public function show(string $id) {}
    public function update(Request $request, string $id) {}
    public function destroy(string $id) {}
}


