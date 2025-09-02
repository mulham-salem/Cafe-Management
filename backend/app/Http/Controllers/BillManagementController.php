<?php

namespace App\Http\Controllers;

use App\Models\PurchaseBill;

class BillManagementController extends Controller
{
    public function index()
    {
        // جلب كل الفواتير مع المورد والعناصر المرتبطة
        $bills = PurchaseBill::with(['supplier', 'inventoryitems'])->get();

        // تركيب الـ JSON حسب المطلوب
        $result = $bills->map(function ($bill) {
            return [
                'id' => $bill->id,
                'purchase_date' => $bill->purchase_date,
                'supplier' => $bill->supplier->company_name ?? null,
                'items' => $bill->inventoryItems->map(function ($item) {
                    return [
                        'name' => $item->name,
                        'quantity' => $item->quantity,
                        'unit' => $item->unit,
                    ];
                }),
                'unit_price' => $bill->unit_price,
                'total_amount' => $bill->total_amount,
            ];
        });

        return response()->json($result);
    }
}
