<?php

namespace App\Http\Controllers;

use App\Events\NewNotificationEvent;
use App\Models\Bill;
use App\Models\Complaint;
use App\Models\Customer;
use App\Models\DeliveryOrder;
use App\Models\Employee;
use App\Models\MenuItem;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderControl;
use App\Models\OrderItem;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use App\Services\LoyaltyService;

class OrderManagementController extends Controller
{
    protected LoyaltyService $loyalty;
    public function __construct(LoyaltyService $loyalty)
    {
        $this->autoResume();
        $this->loyalty = $loyalty;
    }

    /**
     * Creates a new order.
     */
    public function createOrder(Request $request): JsonResponse // 1
    {
        // --- تحقق من حالة النظام أولاً ---
        $employee = auth('user')->user()->employee ?? null;
        $orderControl = $employee
            ? OrderControl::firstOrCreate(['employee_id' => $employee->id], ['status' => 'open'])
            : OrderControl::first();

        if ($orderControl && $orderControl->status === 'closed') {
            return response()->json([
                'statusMessage' => 'Orders are currently paused. Please try again later.'
            ], 200);
        }

        // --- انتهى التحقق ---

        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.menuItem_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'note' => 'nullable|string|max:100',
            'pickupMethod' => 'required|in:dineIn,takeaway,delivery',
            'scheduledTime' => [
                'nullable',
                'regex:/^(?:[01]\d|2[0-3]):[0-5]\d$/', // HH:mm
            ],
            // في حال كانت delivery
            'deliveryInfo.address' => 'required_if:pickupMethod,delivery|string|max:100',
            'deliveryInfo.city' => 'required_if:pickupMethod,delivery|string|max:100',
            'deliveryInfo.phone' => 'required_if:pickupMethod,delivery|string|max:100',
        ]);

        $user = auth('user')->user();
        $column = $user->role === 'employee' ? 'employee_id' : 'customer_id';

        DB::beginTransaction();

        try {
            $order = Order::create([
                $column => $user->id,
                'status' => 'pending',
                'createdAt' => now(),
                'confirmedAt' => null,
                'note' => $request->input('note'),
                'pickup_method' => $request->input('pickupMethod'),
                'pickup_time' => $request->input('scheduledTime'),
            ]);

            // تحضير المتغيرات
            $loyaltyAccount = null;
            $totalPoints = 0.0;

            // optimization: جلب كل menu items المطلوبة دفعة وحدة
            $menuItemIds = collect($request->items)->pluck('menuItem_id')->unique()->filter()->values()->all();
            $menuItems = MenuItem::whereIn('id', $menuItemIds)->get()->keyBy('id');


            foreach ($request->items as $item) {

                $menuItem = $menuItems->get($item['menuItem_id']) ?? null;

                if (! $menuItem || ! $menuItem->available) {
                    throw ValidationException::withMessages([
                        'items' => ['Item "' . ($menuItem?->name ?? 'Unknown') . '" is not available.'],
                    ]);
                }

                $quantity = (int) ($item['quantity'] ?? 1);
                $totalPriceForItem = (float) $menuItem->price * $quantity;

                OrderItem::create([
                    'order_id' => $order->id,
                    'menuItem_id' => $menuItem->id,
                    'item_name' => $menuItem->name,
                    'quantity' => $quantity,
                    'price' => $totalPriceForItem, // إن أردت تخزين السعر للوحدة: أضف unit_price و total_price
                ]);

                // جمع النقاط — لا ننفذ الإضافة هنا، فقط نجمع
                if (! $employee) {
                    $totalPoints += $totalPriceForItem * 0.5; // عدّل معدل التحويل للنقاط كما تريد
                }
            }

            // بعد الانتهاء من اللوب، نضيف النقاط مرة واحدة (إذا في نقاط)
            if (! $employee && $totalPoints > 0) {
                // تقريب إلى منزلتين عشريتين لو لازم
                $totalPoints = round($totalPoints, 2);
                $loyaltyAccount = $this->loyalty->addPoints($order->customer_id, $totalPoints);
            }

            // في حال delivery: إنشاء سجل في جدول delivery_orders
            if ($request->pickupMethod === 'delivery') {
                $deliveryFee = rand(1, 6); // قيمة عشوائية بين 3 و 10
                $etaMinutes = rand(20, 60); // وقت توصيل عشوائي بالدقايق

                DeliveryOrder::create([
                    'delivery_worker_id' => null,
                    'order_id' => $order->id,
                    'status' => 'unassigned',
                    'delivery_fee' => $deliveryFee,
                    'address' => $request->input('deliveryInfo.address'),
                    'city' =>  $request->input('deliveryInfo.city'),
                    'phone' =>  $request->input('deliveryInfo.phone'),
                    'pickup_time' => $order->pickup_time,
                    'estimated_time' => now()->addMinutes($etaMinutes),
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Order #' . $order->id . ' created successfully',
                'loyalty_account' => $loyaltyAccount,
                'loyalty_points' => $totalPoints,
            ], 201);

        } catch (Exception $e) {
            DB::rollBack();

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Retrieves orders for the authenticated customer or employee.
     */
    public function getCustomerOrders(): JsonResponse // 2
    {
        $user = auth('user')->user();

        $query = Order::with(['orderItems.menuItem', 'bill', 'deliveryOrder', 'customer']);

        if ($user->role === 'customer') {
            $query->where('customer_id', $user->id);
        }

        $orders = $query->orderByDesc('created_at')->get();

        if ($orders->isEmpty()) {
            return response()->json(['message' => 'No orders found'], 404);
        }

        return response()->json([
            'data' => $orders->map(function ($order) {
                // 🔥 delivery details
                $deliveryData = null;
                if ($order->pickup_method === 'delivery' && $order->deliveryOrder) {
                    $deliveryData = [
                        'address'        => $order->deliveryOrder->address ?? '',
                        'city'           => $order->deliveryOrder->city ?? '',
                        'phone'          => $order->deliveryOrder->phone ?? '',
                        'delivery_fee'   => number_format($order->deliveryOrder->delivery_fee, 2),
                        'estimated_time' => $order->deliveryOrder->estimated_time
                            ? Carbon::parse($order->deliveryOrder->estimated_time)->format('h:i A')
                            : null,
                    ];
                }

                return [
                    'order_id'      => $order->id,
                    'status'        => $order->status,
                    'created_at'    => $order->createdAt,
                    'can_show_bill' => $order->status === 'delivered' && $order->bill !== null,
                    'note'          => $order->note ?? '-',
                    'pickup_method' => $order->pickup_method ?? 'dineIn',
                    'pickup_time'   => $order->pickup_time
                        ? Carbon::parse($order->pickup_time)->format('h:i A')
                        : 'ASAP',

                    // 🔥 Customer full name
                    'customer_name' => $order->customer->user->full_name ?? 'Unknown',

                    // 🔥 Delivery data
                    'delivery'      => $deliveryData,

                    'items' => $order->orderItems->map(function ($item) {
                        return [
                            'item_name' => $item->menuItem->name,
                            'price'     => number_format($item->price / $item->quantity, 2),
                            'quantity'  => $item->quantity,
                        ];
                    }),

                    'item_count' => $order->orderItems->count(),
                ];
            }),
        ], 200);
    }

    /**
     * Edits an existing order. Supports GET (to show edit interface) and PUT (to update order).
     *
     * @param  int  $orderId
     */
    public function editOrder(Request $request, $orderId) // 3
    {
        // --- تحقق من حالة النظام أولاً ---
        $employee = auth('user')->user()->employee ?? null;
        $orderControl = $employee
            ? OrderControl::firstOrCreate(['employee_id' => $employee->id], ['status' => 'open'])
            : OrderControl::first();

        if ($orderControl && $orderControl->status === 'closed') {
            return response()->json([
                'statusMessage' => 'Orders are currently paused. Please try again later.'
            ], 200);
        }
        // --- انتهى التحقق ---

        $user = auth('user')->user();
        $column = $user->role === 'employee' ? 'employee_id' : 'customer_id';

        $query = Order::with('orderItems.menuItem')
            ->where('id', $orderId)
            ->where('status', 'pending');

        if ($user->role !== 'employee') {
            $query->where('customer_id', $user->id);
        }

        $order = $query->first();

        if (! $order && $user->role !== 'employee') {
            return response()->json([
                'message' => 'Can only edit unconfirmed orders or this order not yours',
            ], 403);
        }

        if ($request->isMethod('get')) {
            $items = $order->orderItems->map(function ($item) {
                return [
                    'menuItem_id' => $item->menuItem_id,
                    'name'        => $item->menuItem->name,
                    'quantity'    => $item->quantity,
                    'price'       => $item->price,
                    'formatted'   => $item->menuItem->name.' * '.$item->quantity.' ('.number_format($item->price, 2).')',
                ];
            });

            // 🔥 جلب معلومات التوصيل من جدول DeliveryOrder
            $deliveryInfo = null;
            if ($order->pickup_method === 'delivery' && $order->DeliveryOrder) {
                $deliveryInfo = [
                    'address' => $order->DeliveryOrder->address ?? '',
                    'city'    => $order->DeliveryOrder->city ?? '',
                    'phone'   => $order->DeliveryOrder->phone ?? '',
                    'deliveryFee' => $order->DeliveryOrder->delivery_fee ?? 0,
                    'etaText' => $order->DeliveryOrder->estimated_time ?? 'N/A',
                ];
            }

            return response()->json([
                'order_id'      => $order->id,
                'note'          => $order->note,
                'pickupMethod' => $order->pickup_method,
                'pickupTime'   => $order->pickup_time,
                'deliveryInfo' => $deliveryInfo,
                'items'         => $items,
            ]);
        }

        if ($request->isMethod('put')) {

            $validated = $request->validate([
                'items' => 'required|array|min:1',
                'items.*.menuItem_id' => 'required|exists:menu_items,id',
                'items.*.quantity' => 'required|integer|min:0',
                'note' => 'nullable|string',
                'pickupMethod' => 'required|in:dineIn,takeaway,delivery',
                'scheduledTime' => [
                    'nullable',
                    'regex:/^(?:[01]\d|2[0-3]):[0-5]\d$/', // HH:mm
                ],
                // في حال كانت delivery
                'deliveryInfo.address' => 'required_if:pickupMethod,delivery|string|max:100',
                'deliveryInfo.city' => 'required_if:pickupMethod,delivery|string|max:100',
                'deliveryInfo.phone' => 'required_if:pickupMethod,delivery|string|max:100',
            ]);

            DB::beginTransaction();

            try {
                // IDs العناصر الجديدة اللي جايين من الواجهة
                $newItemIds = collect($validated['items'])->pluck('menuItem_id');

                // حذف العناصر القديمة اللي مو موجودة بالـ request
                OrderItem::where('order_id', $order->id)
                    ->whereNotIn('menuItem_id', $newItemIds)
                    ->delete();

                foreach ($validated['items'] as $item) {
                    $menuItem = MenuItem::find($item['menuItem_id']);

                    if (!$menuItem->available) {
                        throw ValidationException::withMessages([
                            'menuItem_id' => "item {$menuItem->name} unavailable now",
                        ]);
                    }

                    $totalPriceForItem = $menuItem->price * $item['quantity'];

                    if ($item['quantity'] < 1) {
                        OrderItem::where('order_id', $order->id)
                            ->where('menuItem_id', $item['menuItem_id'])
                            ->delete();
                    } else {
                        OrderItem::updateOrCreate(
                            [
                                'order_id' => $order->id,
                                'menuItem_id' => $item['menuItem_id'],
                            ],
                            [
                                'item_name' => $menuItem->name,
                                'quantity' => $item['quantity'],
                                'price' => $totalPriceForItem,
                            ]
                        );
                    }
                }
                // تحديث معلومات الطلب الأساسية
                $order->pickup_method = $validated['pickupMethod'];
                $order->pickup_time = $validated['scheduledTime'];
                $order->note = $validated['note'] ?? null;
                $order->save();

                // في حال delivery: إنشاء سجل في جدول delivery_orders
                $pickupMethod = $request->input('pickupMethod');

                if ($pickupMethod === 'delivery') {
                    $deliveryInfo = $request->input('deliveryInfo', []);

                    $deliveryData = [
                        'delivery_worker_id' => null,
                        'status'             => 'unassigned',
                        'delivery_fee'       => rand(3, 10),
                        'address'            => $deliveryInfo['address'] ?? null,
                        'city'               => $deliveryInfo['city'] ?? null,
                        'phone'              => $deliveryInfo['phone'] ?? null,
                        'pickup_time'        => $order->pickup_time,
                        'estimated_time'     => now()->addMinutes(rand(20, 60)),
                    ];

                    // إما تحديث أو إنشاء
                    DeliveryOrder::updateOrCreate(
                        ['order_id' => $order->id], // شرط البحث
                        $deliveryData              // القيم للتحديث/الإنشاء
                    );
                } else {
                    // لو غير ديلفري نحذف أي سجل قديم
                    DeliveryOrder::where('order_id', $order->id)->delete();
                }

                DB::commit();

                return response()->json([
                    'message' => 'Order '.$order->id.' updated successfully',
                ]);
            } catch (Exception $e) {
                DB::rollBack();

                return response()->json([
                    'message' => 'Failed editing the order',
                    'error' => $e->getMessage(),
                ], 500);
            }
        }

        return response()->json([
            'message' => 'Invalid Request',
        ], 405);
    }

    /**
     * Allows a user (customer or employee) to cancel a pending order.
     *
     * @param  int  $id
     */
    public function cancelOrder($id): JsonResponse // 4
    {
        $user = auth('user')->user();
        $order = Order::with(['employee.user', 'customer.user'])->findOrFail($id);

        if ($order->confirmedAt !== null) {
            return response()->json([
                'message' => "Can't be deleted after confirming it or preparing ",
            ], 403);
        }

        $hasPermission =
            ($user->role === 'employee' && $order->employee_id === $user->id) ||
            ($user->role === 'customer' && $order->customer_id === $user->id);

        if (! $hasPermission && $user->role !== 'employee') {
            return response()->json([
                'message' => "You don't have permission to cancel this order.",
            ], 403);
        }

        $order->delete();

        return response()->json([
            'message' => ' Order deleted successfully',
        ]);
    }

    /**
     * Allows a user (customer or employee) to confirm a pending order.
     *
     * @param  int  $id
     */
    public function confirmOrder($id): JsonResponse // 5
    {
        $user = auth('user')->user();
        $order = Order::with('orderItems.menuItem', 'deliveryOrder')->findOrFail($id);

        if ($order->confirmedAt !== null) {
            return response()->json([
                'message' => 'Order is already confirmed!',
            ], 422);
        }

        $hasPermission =
            ($user->role === 'employee' && $order->employee_id === $user->id) ||
            ($user->role === 'customer' && $order->customer_id === $user->id);

        if (! $hasPermission && $user->role !== 'employee') {
            return response()->json(['message' => 'No permission to confirm'], 403);
        }

        if ($order->orderItems->isEmpty()) {
            return response()->json(['message' => 'order is empty!'], 422);
        }

        DB::beginTransaction();
        try {
            $order->update([
                'confirmedAt' => now(),
                'status' => 'confirmed',
            ]);

            $notificationMessage = "Order #{$order->id} has been confirmed. Details:\n";
            $totalAmount = 0;
            foreach ($order->orderItems as $item) {
                $totalAmount += $item->quantity * $item->menuItem->price;
                $notificationMessage .= "- {$item->menuItem->name} (Qty: {$item->quantity}, Price: $".number_format($item->price, 2).")\n";
            }

            $delivery_fee = $order->deliveryOrder->delivery_fee ?? 0;
            if ($order->deliveryOrder) {
                $totalAmount += $delivery_fee;
            }

            Bill::create([
                'order_id' => $order->id,
                'total_amount' => $totalAmount,
                'date_issued' => now(),
            ]);

            $notificationMessage .= 'Total Amount: $'.number_format($totalAmount, 2);
            $notificationMessage .= "\nNote: ".($order->note ?? 'N/A');

            $user = auth('user')->user();

            Notification::create([
                'user_id' => $user->id,
                'sent_by' => 'System',
                'purpose' => 'Order Confirmation',
                'message' => $notificationMessage,
                'createdAt' => now(),
                'seen' => false,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Order confirmed successfully',
            ]);
        } catch (Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function storeComplaint(Request $request) // 6
    {
        $user = auth('user')->user()->id;
        $request->validate([
            'type' => 'required|in:order,reservation,service',
            'details' => 'required|string|max:1000',
        ]);

        try {
            $complaint = Complaint::create([
                'customer_id' => $user,
                'type' => $request->type,
                'description' => $request->details, // mapping details → description
                'note' => null,
            ]);

            return response()->json([
                'message' => 'Complaint submitted successfully!',
                'data' => $complaint,
            ], 201);

        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to submit complaint',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function requestRePreparation(Request $request) // 7
    {
        $user = auth('user')->user();

        // Validate request
        $validated = $request->validate([
            'orderId' => 'required|exists:orders,id',
            'reason'  => 'required|string|max:255',
        ]);

        // Fetch the order
        $order = Order::where('id', $validated['orderId'])
            ->where('customer_id', $user->id) // Make sure the order belongs to this customer
            ->firstOrFail();

        // Check if the order is delivered
        if ($order->status !== 'delivered') {
            return response()->json([
                'message' => 'You can only request re-preparation for delivered orders.',
            ], 400);
        }

        // Update order fields
        $order->update([
            'status'                => 'preparing',
            'repreparation_request' => 1,
            'repreparation_reason'  => $validated['reason'],
        ]);

        //🔥 Update related delivery order
        if ($order->pickup_method === 'delivery') {
            DeliveryOrder::where('order_id', $order->id)->update(['status' => 'unassigned']);
        }

        // 🔥 إشعار لكل الموظفين
        $employees = Employee::with('user')->get(); // جلب كل الموظفين مع الـ user_id

        foreach ($employees as $employee) {
            if ($employee->user) {
                $notification = Notification::create([
                    'user_id'   => $employee->user->id, // id من جدول users
                    'sent_by'   => 'System',
                    'purpose'   => 'Order Re-Preparation',
                    'message'   => "The customer requested re-preparation for order #{$order->id}.",
                    'createdAt' => now(),
                    'seen' => false,
                ]);
                event(new NewNotificationEvent($notification));
            }
        }

        return response()->json([
            'message' => 'Re-preparation request submitted successfully.',
            'order_id' => $order->id,
        ], 200);
    }

    public function reorderOrder($orderId) // 8
    {
        try {
            // جلب الطلب مع علاقة الـ deliveryOrder
            $order = Order::with('deliveryOrder', 'bill')->findOrFail($orderId);

            // تحديث حالة الطلب إلى pending
            $order->status = 'pending';
            $order->confirmedAt = null;
            $order->createdAt = now();
            $order->bill->delete();
            $order->save();

            // إذا طريقة الاستلام delivery، حدث حالة deliveryOrder
            if ($order->pickup_method === 'delivery' && $order->deliveryOrder) {
                $order->deliveryOrder->status = 'unassigned';
                $order->deliveryOrder->save();
            }

            return response()->json([
                'message' => 'Order has been reordered successfully',
                'order' => $order,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to request the order.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function rateOrder(Request $request): JsonResponse
    {
        $data = $request->validate([
            'orderId' => 'required|integer|exists:orders,id',
            'orderRating' => 'required|numeric|min:0|max:5',
            'deliveryRating' => 'nullable|numeric|min:0|max:5',
            'notes' => 'nullable|string|max:1000',
        ]);

        // إحضار الطلب
        $order = Order::findOrFail($data['orderId']);

        // تحديث تقييم الطلب نفسه
        $order->rating_score = $data['orderRating'];
        $order->rating_comment = $data['notes'];
        $order->save();

        // إذا كان الطلب توصيل، تحديث جدول التوصيل
        if ($order->pickup_method === 'delivery') {
            if ($data['deliveryRating'] !== null) {
                $delivery = DeliveryOrder::where('order_id', $order->id)->first();

                if ($delivery) {
                    $delivery->rating_score = $data['deliveryRating'];
                    $delivery->rating_comment = $data['notes'];
                    $delivery->save();
                }
            }
        }

        return response()->json([
            'message' => 'Rating submitted successfully',
            'order' => $order,
        ]);
    }// 9

    // ----------------------------------------------------Employee Only---------------------------------------------------//

    /**
     * Allows an employee to update the status of an order.
     *
     * @param  int  $orderId
     */
    public function updateOrderStatus(Request $request, $orderId): JsonResponse
    {
        $employee = auth('user')->user();

        $order = Order::with('customer', 'employee')->findOrFail($orderId);

        $current = $order->status;
        $new = $request->input('status');

        if ($current === 'pending') {
            return response()->json(['error' => 'Cannot update status before confirmation'], 403);
        }

        if ($order->pickup_method === 'delivery' && $new === 'delivered') {
            return response()->json(['error' => 'Delivery orders cannot be marked as delivered manually.'], 403);
        }

        if (
            ($current === 'confirmed' && $new === 'preparing') ||
            ($current === 'preparing' && $new === 'ready') ||
            ($current === 'ready' && $new === 'delivered')
        ) {
            $order->status = $new;
            $order->save();

            $isEmployeeCreator = $order->employee && $order->employee->id === $employee->id;

            if ($new === 'ready' && ! $isEmployeeCreator) {
                Notification::create([
                    'user_id' => $employee->id,
                    'sent_by' => 'System',
                    'purpose' => 'Order Ready',
                    'message' => "The customer has been notified that the order #{$order->id} is ready.",
                    'createdAt' => now(),
                ]);

                $notification = Notification::create([
                    'user_id' => $order->customer->id,
                    'sent_by' => 'System',
                    'purpose' => 'Order Ready',
                    'message' => "Your order #{$order->id} is ready now!",
                    'createdAt' => now(),
                    'seen' => false,
                ]);
                event(new NewNotificationEvent($notification));
            }

            return response()->json([
                'message' => 'Order status updated successfully.',
                'order' => $order,
                'notifiedCustomer' => ! $isEmployeeCreator,
            ]);
        }

        return response()->json([
            'error' => 'Invalid status transition.',
        ], 403);
    } // 10

    /**
     * Searches for an order by its ID and optionally by status.
     */
    public function searchOrder(Request $request): JsonResponse
    {
        $orderId = $request->query('order_id');
        $statuses = $request->query('statuses');

        $query = Order::with('orderItems', 'customer', 'employee')
            ->where('id', $orderId);

        if ($statuses) {
            $statusesArray = explode(',', $statuses);
            $query->whereIn('status', $statusesArray);
        }

        $order = $query->first();

        if (! $order) {
            return response()->json([
                'message' => 'Order not found.',
            ], 404);
        }

        return response()->json([
            'data' => [
                'order_id' => $order->id,
                'created_at' => $order->createdAt,
                'status' => $order->status,
                'note' => $order->note ?? '-',
                'item_count' => $order->orderItems->count(),
                'pickup_method' => $order->pickup_method ?? 'dineIn',
                'pickup_time' => $order->pickup_time ?? 'ASAP',
                'items' => $order->orderItems->map(function ($item) {
                    return [
                        'item_name' => $item->menuItem->name,
                        'quantity' => $item->quantity,
                    ];
                }),
            ],
        ]);
    } // 11

    /**
     * Retrieves orders intended for the kitchen display (confirmed, preparing, ready, delivered).
     */
    public function getKitchenOrders(): JsonResponse
    {
        $orders = Order::with(['orderItems.menuItem', 'customer', 'employee'])
            ->whereIn('status', ['confirmed', 'preparing', 'ready'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $orders->map(function ($order) {
                return [
                    'order_id' => $order->id,
                    'status' => $order->status,
                    'note' => $order->note ?? '-',
                    'pickup_method' => $order->pickup_method ?? 'dineIn',
                    'pickup_time' => $order->pickup_time ?? 'ASAP',
                    'rePreparation_reason' => $order->repreparation_request == 1
                        ? $order->repreparation_reason
                        : null,
                    'orderItems' => $order->orderItems->map(function ($item) {
                        return [
                            'item_name' => $item->menuItem->name,
                            'quantity' => $item->quantity,
                        ];
                    }),
                ];
            }),
        ]);
    } // 12

    /**
     * Get customer contact info by order ID.
     */
    public function getContactInfo($orderId): JsonResponse
    {
        // ابحث عن الطلب
        $order = Order::findOrFail($orderId);

        // جيب الـ customer_id من الطلب
        $customer = Customer::find($order->customer_id);

        if (!$customer) {
            return response()->json([
                'message' => 'Customer not found for this order. Please ensure that the order was not created by you!'
            ], 200);
        }

        return response()->json([
            'name'  => $customer->user->full_name,
            'phone' => $customer->phone_number,
            'email' => $customer->user->email,
        ]);
    }// 14

    /**
     * Suspend (Put On Hold) the order
     */
    public function suspend($orderId): JsonResponse
    {
        $order = Order::find($orderId);

        if (!$order) {
            return response()->json([
                'message' => 'Order not found.'
            ], 404);
        }

        if ($order->onHold == 1) {
            return response()->json([
                'message' => 'Order is already on hold.'
            ], 400);
        }

        $order->onHold = 1;
        $order->status = 'onHold'; // Optional: Track status textually
        $order->save();

        return response()->json([
            'message' => 'Order has been suspended successfully!',
            'order'   => $order
        ], 200);
    }// 15

    /**
     * Resume the order
     */
    public function resume($orderId): JsonResponse
    {
        $order = Order::find($orderId);

        if (!$order) {
            return response()->json([
                'message' => 'Order not found.'
            ], 404);
        }

        if ($order->onHold == 0) {
            return response()->json([
                'message' => 'Order is not on hold.'
            ], 400);
        }

        $order->onHold = 0;
        $order->status = 'preparing';
        $order->save();

        return response()->json([
            'message' => 'Order has been resumed successfully!',
            'order'   => $order
        ], 200);
    }// 16

    /**
     * Get current order control status for the logged-in employee
     */
    public function getOrderControlStatus()
    {
        $employee = Auth::guard('user')->user()->employee;

        // جلب السجل الحالي فقط، بدون إنشاء جديد
        $orderControl = OrderControl::where('employee_id', $employee->id)->first();

        return response()->json([
            'status' => $orderControl?->status,       // 'closed' أو 'open' أو null إذا ما موجود
            'resume_at' => $orderControl?->resume_at // الوقت لو محدد
        ], 200);
    }// 17

    /**
     * Pause receiving orders.
     * Sets status to 'closed' in order_control.
     */
    public function pauseOrders(Request $request)
    {
        $employee = Auth::guard('user')->user()->employee; // assuming logged-in employee
        $resumeAt = $request->input('duration'); // can be null or datetime string

        $orderControl = OrderControl::firstOrCreate(
            ['employee_id' => $employee->id],
            ['status' => 'open']
        );

        $orderControl->status = 'closed';
        $orderControl->resume_at = $resumeAt ? Carbon::parse($resumeAt) : null;

        $orderControl->save();

        return response()->json([
            'message' => $resumeAt
                ? "Orders paused until {$orderControl->resume_at}"
                : "Orders paused successfully",
            'status' => $orderControl->status,
            'resume_at' => $orderControl->resume_at,
        ], 200);
    }// 18

    /**
     * Resume receiving orders.
     * Sets status to 'open' in order_control.
     */
    public function resumeOrders(Request $request)
    {
        $employee = Auth::guard('user')->user()->employee;

        $orderControl = OrderControl::firstOrCreate(
            ['employee_id' => $employee->id],
            ['status' => 'closed']
        );

        $orderControl->status = 'open';
        $orderControl->resume_at = null;

        $orderControl->save();

        return response()->json([
            'message' => 'Orders resumed successfully',
            'status'  => $orderControl->status,
            'resume_at' => null,
        ], 200);
    }// 19

    /**
     * Auto resume receiving orders after time is up.
     * Sets status to 'open' in order_control.
     */
    public function autoResume()
    {
        $orderControls = OrderControl::where('status', 'closed')
            ->whereNotNull('resume_at')
            ->where('resume_at', '<=', now())
            ->get();

        foreach ($orderControls as $control) {
            $resumeAt =  $control->resume_at;

            $control->status = 'open';
            $control->resume_at = null;
            $control->save();

            $formattedTime = Carbon::parse($resumeAt)->format('Y-m-d H:i');
            $notification = Notification::create([
                'user_id' => $control->employee_id,
                'sent_by' => 'System',
                'purpose' => 'Orders Controls',
                'message' => "orders controls resumed automatically at {$formattedTime}",
                'createdAt' => now(),
                'seen' => false,
            ]);
            event(new NewNotificationEvent($notification));
        }
    }// 20
}
