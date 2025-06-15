<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSupplyOfferRequest;
use App\Models\Notification;
use App\Models\Supplier;
use App\Models\SupplyOffer;
use App\Models\SupplyOfferItem;
use Exception;

class SupplierController extends Controller
{
    public function store(StoreSupplyOfferRequest $request)
    {
        $user = auth('user')->user();

        $supplier = Supplier::where('id', $user->id)->firstOrFail();

        try {
            $items = $request->items;
            $totalPrice = collect($items)->sum(function ($item) {
                return $item['quantity'] * $item['unit_price'];
            });

            $supplyOffer = SupplyOffer::create([
                'supplier_id' => $supplier->id,
                'title' => $request->title,
                'delivery_date' => $request->delivery_date,
                'note' => $request->note,
                'total_price' => $totalPrice,
                'status' => 'pending',
            ]);

            foreach ($items as $index => $item) {
                try {
                    SupplyOfferItem::create([
                        'supply_offer_id' => $supplyOffer->id,
                        'name' => $item['name'],
                        'quantity' => $item['quantity'],
                        'unit' => $item['unit'],
                        'unit_price' => $item['unit_price'],
                        'total_price' => $item['quantity'] * $item['unit_price'],
                    ]);
                } catch (Exception $e) {
                    return response()->json("Error inserting item #$index: ".$e->getMessage());
                }
            }
            $managerIds = [3, 4];
            foreach ($managerIds as $index => $managerId) {
                Notification::create([
                    'manager_id' => $managerId,
                    'user_id' => $user->id,
                    'sent_by' => 'supplier',
                    'purpose' => 'SupplyOffers',
                    'message' => "Supplier {$user->name} submitted a new supply offer (#{$supplyOffer->id})",
                    'createdAt' => now(),
                    'seen' => false,
                ]);
            }

            return response()->json(['message' => 'Supply offer submitted successfully.'], 201);

        } catch (Exception $e) {

            return response()->json(['message' => 'Failed to submit offer.', 'error' => $e->getMessage()], 500);
        }
    }

    public function viewMyOffers()
    {
        $supplier = auth('user')->user();

        $supplyOffers = SupplyOffer::with('supplyofferitems')
            ->where('supplier_id', $supplier->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'offers' => $supplyOffers->map(function ($offer) {
                return [
                    'title' => $offer->title,
                    'delivery_date' => $offer->delivery_date,
                    'total_price' => $offer->total_price,
                    'status' => $offer->status,
                    'note' => $offer->status === 'rejected' ? $offer->note : null,
                    'items' => $offer->supplyofferitems->map(function ($item) {
                        return [
                            'name' => $item->name,
                            'quantity' => $item->quantity,
                            'unit' => $item->unit,
                            'unit_price' => $item->unit_price,
                        ];
                    }),
                ];
            }),
        ]);
    }
}
