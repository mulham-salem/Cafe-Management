<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Order;
use Illuminate\Http\Request;
use App\Models\DeliveryOrder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DeliveryController extends Controller
{
    /**
     * GET /user/delivery-worker/delivery-orders
     */
    public function index()
    {
        // assuming you're authenticating delivery workers with guard 'delivery_worker'
        $workerId = Auth::guard('user')->id();

        // Query:
        $deliveryOrders = DeliveryOrder::with([
            'order.orderItems',     // relation: Order -> OrderItems
            'order.customer.user'   // relation: Order -> Customer -> User
        ])
            // skip already delivered delivery_orders
            ->where('status', '!=', 'delivered')
            // show orders assigned to this worker OR those that are unassigned (available)
            ->where(function ($q) use ($workerId) {
                $q->where('delivery_worker_id', $workerId)
                    ->orWhere('status', 'unassigned');
            })
            ->get();

        // map to the shape the frontend expects
        $payload = $deliveryOrders->map(function ($d) {
            $order = $d->order;

            // defensive: if no order (shouldn't happen because of whereHas) skip
            if (!$order) {
                return null;
            }

            // Map items
            $items = collect($order->orderItems ?? [])->map(function ($oi) {
                // attempt to read common field names; adapt if your schema differs
                $quantity = (int)$oi->quantity;
                // unit price field could be unit_price or price
                $unitPrice = (float)$oi->price;
                // name might be on the order_item or via relation (menu_item)
                $name = $oi->item_name;

                $totalPrice = $unitPrice * $quantity;

                return [
                    'name' => $name,
                    'quantity' => $quantity,
                    'unitPrice' => $unitPrice,
                    'totalPrice' => $totalPrice,
                ];
            })->values();

            // total items price
            $totalItemsPrice = $items->sum('totalPrice');

            // customer info
            $customer = $order->customer;

            $customerName = $customer->user->full_name;

            return [
                // id that frontend uses for actions (we return delivery_order id)
                'id' => $d->id,
                'status' => $d->status,
                'items' => $items,
                'estimated_time' => $d->estimated_time,
                'delivery_fee' => $d->delivery_fee,
                'pickup_time' => $d->pickup_time,
                'note' => $order->note ?? null,
                'customer' => [
                    'name' => $customerName,
                    'address' => $d->address,
                    'phone' => $d->phone,
                    'city' => $d->city,
                ],
                // optional: include totals if helpful
                'total_items_price' => (float) $totalItemsPrice,
            ];
        })
            // remove any nulls (defensive)
            ->filter()
            ->values();

        return response()->json($payload);
    }

    /**
     * PATCH /user/delivery-worker/delivery-orders/{id}
     * Update delivery_order.status (and assign worker when accepting).
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:unassigned,assigned,inTransit,delivered',
        ]);

        // use transaction for safety
        return DB::transaction(function () use ($request, $id) {
            $workerId = Auth::guard('user')->id();

            $deliveryOrder = DeliveryOrder::findOrFail($id);

            // If worker accepts the order (Assigned) - make sure the record is assigned to them
            if ($request->status === 'assigned') {
                // if it's unassigned or assigned to someone else, set to this worker
                if (!$deliveryOrder->delivery_worker_id || $deliveryOrder->delivery_worker_id != $workerId) {
                    $deliveryOrder->delivery_worker_id = $workerId;
                }
            }

            $deliveryOrder->status = $request->status;
            $deliveryOrder->save();

            // 🔥 تحديث حالة Order المرتبط
            $order = $deliveryOrder->order;
            if ($order) {
                $orderStatus = match ($request->status) {
                    'assigned'   => 'assigned',
                    'inTransit'  => 'inTransit',
                    'delivered'  => 'delivered',
                    default      => $order->status, // ما نغير شي إذا unassigned
                };

                if ($order->status !== $orderStatus) {
                    $order->status = $orderStatus;
                    $order->save();
                }
            }

            return response()->json([
                'message' => 'Delivery order updated successfully.',
                'delivery_order' => $deliveryOrder,
            ]);
        });
    }

    /**
     * POST /user/delivery-worker/orders/{id}/confirm-receipt
     * Mark delivery_order as Delivered and update underlying order to delivered.
     * $id is delivery_order id in this implementation.
     */
    public function confirmDelivered($id)
    {
        return DB::transaction(function () use ($id) {
            $deliveryOrder = DeliveryOrder::with('order')->findOrFail($id);

            // Check if related order is delivered
            if ($deliveryOrder->order->status !== 'delivered') {
                return response()->json([
                    'message' => 'Customer has not confirmed receipt of this order yet.',
                    'delivery_order' => $deliveryOrder,
                ], 201); // Bad Request
            }

            $deliveryOrder->status = 'delivered';
            $deliveryOrder->save();

            return response()->json([
                'message' => 'Order confirmed as delivered.',
                'delivery_order' => $deliveryOrder,
            ], 200);
        });
    }

    public function confirmReceipt(Request $request, $orderId)
    {
        $customer = auth('user')->user(); // المستخدم الحالي

        // جلب الطلب والتحقق من ملكيته
        $order = Order::where('id', $orderId)
            ->where('customer_id', $customer->id)
            ->firstOrFail();

        // تحديث الحالة
        $order->status = 'delivered';
        $order->save();

        return response()->json([
            'message' => 'Order marked as delivered successfully.',
            'order' => $order
        ], 200);
    }

    public function checkNewOrders()
    {
        $workerId = Auth::guard('user')->id();

        // جيب أول طلب Unassigned
        $unassignedOrder = DeliveryOrder::where('status', 'unassigned')->first();

        if ($unassignedOrder) {
            $orderId = $unassignedOrder->id;
            $notificationMessage = "A new unassigned delivery order #{$orderId} is available.";

            // تحقق إذا فيه إشعار بنفس الرسالة للمستخدم
            $alreadyNotified = Notification::where('user_id', $workerId)
                ->where('message', $notificationMessage)
                ->exists();

            if (!$alreadyNotified) {
                Notification::create([
                    'user_id'   => $workerId,
                    'sent_by'   => 'System',
                    'purpose'   => 'New Delivery Order',
                    'message'   => $notificationMessage,
                    'createdAt' => now(),
                    'seen'      => false,
                ]);
            }

            return response()->json([
                'hasNewOrders' => true,
                'message'      => $notificationMessage
            ]);
        }

        return response()->json([
            'hasNewOrders' => false
        ]);
    }
}
