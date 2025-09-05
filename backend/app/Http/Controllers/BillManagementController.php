<?php

namespace App\Http\Controllers;

use App\Models\PurchaseBill;

class BillManagementController extends Controller
{
    public function index()
    {
        // جلب كل الفواتير مع المورد والعناصر المرتبطة
        $bills = PurchaseBill::with(['supplier', 'inventoryItems'])->get();

        // تركيب الـ JSON حسب المطلوب
        $result = $bills->map(function ($bill) {
            return [
                'id' => $bill->id,
                'date' => $bill->purchase_date,
                'supplier' => $bill->supplier->user->full_name,
                'items' => $bill->inventoryItems->map(function ($item) {
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
}
