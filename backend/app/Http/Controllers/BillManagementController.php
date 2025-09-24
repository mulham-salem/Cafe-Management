<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\PurchaseBill;
use App\Models\SupplyOffer;
use App\UserRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BillManagementController extends Controller
{
    public function fetchPurchaseBill()
    {
        // جلب كل الفواتير مع المورد والعناصر المرتبطة
        $bills = PurchaseBill::with(['supplier', 'supplyOffer'])->get();

        // تركيب الـ JSON حسب المطلوب
        $result = $bills->map(function ($bill) {
            return [
                'id' => $bill->id,
                'date' => $bill->purchase_date,
                'supplier' => $bill->supplier->user->full_name,
                'items' => $bill->supplyOffer->supplyOfferItems->map(function ($item) {
                    return [
                        'name' => $item->name,
                        'quantity' => $item->quantity,
                        'unit' => $item->unit,
                    ];
                }),
                'unit_price' => $bill->unit_price,
                'total' => $bill->total_amount,
            ];
        });

        return response()->json($result);
    }

    /**
     * Store a new purchase bill and update inventory based on an accepted supply offer.
     *
     * @return JsonResponse
     */
    public function storePurchaseBill(Request $request)
    {
        // احصل على الفاعل: إمّا manager عبر غارد manager، أو user عبر الغارد الافتراضي
        if (Auth::guard('manager')->check()) {
            $actor = Auth::guard('manager')->user();
            $isManager = true;
            $managerId = $actor->id;
        } elseif (auth('user')->check()) {
            $actor = auth('user')->user();
            $isManager = false;
            // السماح فقط اذا الـ user هو employee
            if ($actor->role !== UserRole::Employee->value) {
                abort(403, 'Unauthorized');
            }
            // الموظف من المفترض أن له manager_id
            $managerId = $actor->manager_id;
        } else {
            abort(403, 'Unauthorized');
        }
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
            'manager_id' => $managerId,
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
                    'manager_id' => $managerId,
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
}
