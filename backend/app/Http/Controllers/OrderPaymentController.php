<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\Order;
use App\Models\PaymentTransaction;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderPaymentController extends Controller
{
    public function viewOrderBill($orderId): JsonResponse
    {
        $user = auth('user')->user();

        $orderQuery = Order::with([
            'orderItems.menuItem',
            'bill',
            'customer.user',
            'employee.user',
            'deliveryOrder',       // عشان نجيب delivery_fee
            'customer.loyaltyAccount', // one-to-one مع customer
        ])->where('id', $orderId);

        if ($user->role === 'customer') {
            $customerId = optional($user->customer)->id;
            $orderQuery->where('customer_id', $customerId);
        }

        $order = $orderQuery->first();

        if (! $order) {
            return response()->json(['message' => "Order isn't existed or unavailable"], 404);
        }

        if ($order->status !== 'delivered') {
            return response()->json(['message' => "Order isn't delivered yet ,can't show invoice now "], 403);
        }

        if ($order->employee_id) {
            $username = optional($order->employee)->user->full_name ?? 'Unknown Employee';
        } elseif ($order->customer_id) {
            $username = optional($order->customer)->user->full_name ?? 'Unknown Customer';
        } else {
            $username = 'Unknown';
        }

        $items = $order->orderItems->map(function ($item) {
            return [
                'menu_item' => $item->menuItem->name,
                'quantity' => $item->quantity,
                'price' => number_format($item->price, 2),
            ];
        });

        // Delivery Fee (if delivery)
        $deliveryFee = null;
        if ($order->pickup_method === 'delivery' && $order->deliveryOrder) {
            $deliveryFee = $order->deliveryOrder->delivery_fee ?? 0;
        }

        // Loyalty Info
        $loyalty = null;
        if ($order->customer && $order->customer->loyaltyAccount) {
            $loyalty = [
                'balance' => $order->customer->loyaltyAccount->points_balance,
                'pointValue' => 0.01, // ثابت كما طلبت
                'tier' => $order->customer->loyaltyAccount->tier,
                'lastUpdate' => $order->customer->loyaltyAccount->last_update,
            ];
        }

        // حساب subtotal
        $subtotal = $order->orderItems->reduce(function ($carry, $item) {
            return $carry + ($item->quantity * $item->menuItem->price);
        }, 0);

        $grossTotal = $subtotal + $deliveryFee;

        return response()->json([
            'message' => "Bill for order #{$order->id}",
            'order_id' => $order->id,
            'username' => $username,
            'pickupMethod' => $order->pickup_method,
            'items' => $items,
            'deliveryDetails' => [
                'deliveryFee' => $deliveryFee,
            ],
            'subtotal' => round($subtotal, 2),
            'gross_total' => round($grossTotal, 2),
            'loyalty' => $loyalty,
            'total_price' => round(optional($order->bill)->total_amount ?? $grossTotal, 2),        ], 200);
    }

    public function previewPoints(Request $request): JsonResponse
    {
        $request->validate([
            'orderId' => 'required|integer|exists:orders,id',
            'points'  => 'required|numeric|min:0',
        ]);

        $order = Order::with(['orderItems.menuItem', 'deliveryOrder', 'customer.loyaltyAccount'])
            ->findOrFail($request->orderId);

        $pointValue = 0.01; // ثابت

        // نفس حساب subtotal وdelivery fee
        $subtotal = $order->orderItems->reduce(
            fn($carry, $item) => $carry + ($item->quantity * $item->menuItem->price),
            0
        );
        $deliveryFee = ($order->pickup_method === 'delivery' && $order->deliveryOrder)
            ? $order->deliveryOrder->delivery_fee ?? 0
            : 0;

        $grossTotal = $subtotal + $deliveryFee;
        $usingPoints = (int) $request->points;
        $discount = min($usingPoints * $pointValue, $grossTotal);
        $netTotal = max(0, $grossTotal - $discount);

        return response()->json([
            'bill' => [
                'subtotal' => round($subtotal, 2),
                'delivery_fee' => round($deliveryFee, 2),
                'discount' => round($discount, 2),
                'total_amount' => round($netTotal, 2),
            ],
        ]);
    }

    public function applyPoints(Request $request): JsonResponse
    {
        $request->validate([
            'orderId' => 'required|integer|exists:orders,id',
            'points'  => 'required|numeric|min:0',
        ]);

        $user = auth('user')->user();
        $pointValue = 0.01; // ثابت: كل نقطة = 0.01$

        try {
            return DB::transaction(function () use ($request, $user, $pointValue) {
                $order = Order::with(['orderItems.menuItem', 'deliveryOrder', 'customer.loyaltyAccount'])
                    ->findOrFail($request->orderId);

                // تحقق أن المستخدم هو صاحب الطلب
                if ($user->role === 'customer' && $order->customer_id !== $user->customer->id) {
                    return response()->json(['message' => 'Unauthorized to modify this order'], 403);
                }

                $loyaltyAccount = optional($order->customer)->loyaltyAccount;
                if (! $loyaltyAccount) {
                    return response()->json(['message' => 'No loyalty account found'], 404);
                }

                $usingPoints = (int) $request->points;
                $balance = $loyaltyAccount->points_balance;

                // تحقق من الرصيد
                if ($usingPoints > $balance) {
                    return response()->json(['message' => "You don't have enough points."], 400);
                }

                // حساب subtotal
                $subtotal = $order->orderItems->sum(fn($item) => $item->quantity * $item->menuItem->price);

                // حساب delivery fee
                $deliveryFee = ($order->pickup_method === 'delivery' && $order->deliveryOrder)
                    ? $order->deliveryOrder->delivery_fee ?? 0
                    : 0;

                $grossTotal = $subtotal + $deliveryFee;

                // حساب الخصم بناءً على النقاط
                $discount = $usingPoints * $pointValue;

                if ($discount > $grossTotal) {
                    return response()->json(['message' => "Selected points exceed the invoice amount."], 400);
                }

                $netTotal = max(0, $grossTotal - $discount);

                // إنشاء Bill
                $bill = Bill::updateOrCreate(
                    ['order_id' => $order->id],
                    [
                        'total_amount' => $netTotal,
                        'used_loyalty_points' => $usingPoints,
                        'date_issued' => now(),
                    ]
                );

                // تحديث نقاط الولاء
                $loyaltyAccount->points_balance -= $usingPoints;
                $loyaltyAccount->save();

                return response()->json([
                    'message' => 'Loyalty points applied.',
                    'bill' => [
                        'order_id' => $bill->order_id,
                        'discount' => round($discount, 2),
                        'total_amount' => round($netTotal, 2),
                    ],
                    'loyalty' => [
                        'balance' => $loyaltyAccount->points_balance,
                        'point_value' => $pointValue,
                        'tier' => $loyaltyAccount->tier,
                    ],
                ], 200);
            });
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to apply loyalty points.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function charge(Request $request): JsonResponse
    {
        $request->validate([
            'orderId' => 'required|integer',
            'amount' => 'required|numeric|min:0',
            'method' => 'required|string|in:visacard/mastercard,applepay',
            'card' => 'nullable|array', // optional for ApplePay
        ]);

        // إيجاد الفاتورة المرتبطة بالطلب
        $bill = Bill::where('order_id', $request->orderId)->first();

        if (!$bill) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Bill not found for this order.'
            ], 404);
        }

        if ($bill->is_paid) {
            return response()->json([
                'message' => 'this order has been prepaid',
            ], 400);
        }

        // هنا عادة تتصل ببوابة الدفع وتتحقق من نجاح العملية
        // لكن إذا بدنا مجرد تخزين البيانات بعد نجاح افتراضي:
        $transactionCode = Str::upper(Str::random(12)); // مثال على كود العملية
        $processedAt = Carbon::now();

        $payment = PaymentTransaction::create([
            'bill_id' => $bill->id,
            'method' => $request->input('method'),
            'status' => 'completed',
            'transaction_code' => $transactionCode,
            'processed_at' => $processedAt,
        ]);

        return response()->json([
            'status' => 'succeeded',
            'transaction' => $payment,
        ]);
    }

    public function markPaid($orderId): JsonResponse
    {
        // إيجاد الفاتورة المرتبطة بالطلب
        $bill = Bill::where('order_id', $orderId)->first();

        if (!$bill) {
            return response()->json([
                'message' => 'Bill not found for this order.'
            ], 404);
        }

        if ($bill->is_paid) {
            return response()->json([
                'message' => 'This bill is already marked as paid.',
                'bill' => $bill,
            ], 400);
        }

        $hasTransaction = PaymentTransaction::where('bill_id', $bill->id)->exists();

        // تحديث الحقول المطلوبة
        $bill->payment_method = $hasTransaction ? 'card/online' : 'cash';
        $bill->date_issued = Carbon::now();
        $bill->is_paid = 1;
        $bill->save();

        return response()->json([
            'message' => 'Bill marked as paid successfully.',
            'bill' => $bill
        ]);
    }

}
