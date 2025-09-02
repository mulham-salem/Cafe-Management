<?php

namespace App\Http\Controllers;

use App\Models\SupplyOffer;
use App\Models\SupplyRequest;

class supplyHistoryController extends Controller
{
    public function index()
    {
        // ====== جلب عروض التوريد (supply offers) ======
        $offers = SupplyOffer::with('supplyOfferItems')->get()->map(function ($offer) {
            return [
                'id' => $offer->id,
                'title' => $offer->title,
                'type' => 'supply offer',
                'status' => $offer->status,
                'supplyDate' => $offer->delivery_date,
                'items' => $offer->supplyOfferItems->map(function ($item) {
                    return [
                        'name' => $item->name,
                        'quantity' => $item->quantity,
                        'unit' => $item->unit,
                    ];
                }),
                'totalPrice' => $offer->total_price,
                'rejectionReason' => $offer->reject_reason,
            ];
        });

        // ====== جلب طلبات التوريد (supply requests) ======
        $requests = SupplyRequest::with(['supplyRequestItems.inventoryItem'])->get()->map(function ($request) {
            return [
                'id' => $request->id,
                'title' => $request->title,
                'type' => 'supply request',
                'status' => $request->status,
                'supplyDate' => $request->request_date,
                'items' => $request->supplyRequestItems->map(function ($item) {
                    return [
                        'name' => $item->inventoryItem->name ?? null,
                        'quantity' => $item->quantity,
                        'unit' => $item->inventoryItem->unit ?? null,
                    ];
                }),
                'totalPrice' => null, // الطلب ما فيه total price
                'rejectionReason' => $request->reject_reason,
            ];
        });

        // ====== دمج الطلبات والعروض مع بعض ======
        $history = $offers->merge($requests)->sortBy('id')->values();

        return response()->json($history);
    }
}
