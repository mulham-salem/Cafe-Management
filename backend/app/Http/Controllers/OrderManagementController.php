<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\Customer;
use App\Models\DeliveryOrder;
use App\Models\MenuItem;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderControl;
use App\Models\OrderItem;
use App\Models\Promotion;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderManagementController extends Controller
{
    public function __construct()
    {
        $this->autoResume();
    }

    /**
     * Fetches menu items, optionally filtered by category.
     */
    public function fetchMenuItems(Request $request): JsonResponse // 1
    {
        $category = $request->query('category', 'all');

        $query = MenuItem::with('category');

        if ($category === 'drinks') {
            $query->where('category_id', 1);
        } elseif ($category === 'snacks') {
            $query->where('category_id', 2);
        }

        $menuItems = $query->get();

        if ($menuItems->isEmpty()) {
            return response()->json([
                'message' => "There aren't any item available now ",
            ], 200);
        }

        return response()->json([
            'data' => $menuItems->map(function ($item) {
                return [
                    'id' => $item->id,
                    'image' => $item->image_url,
                    'name' => $item->name,
                    'description' => $item->description,
                    'price' => $item->price,
                    'category' => $item->category->name,
                    'available' => $item->available,
                    'isFavorite' => $item->isFavorite,
                ];
            }),
        ], 200);
    }

    public function fetchTopSales(Request $request): JsonResponse
    {
        $topSales = DB::table('bills')
            ->join('orders', 'bills.order_id', '=', 'orders.id')
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('menu_items', 'order_items.menuItem_id', '=', 'menu_items.id')
            ->select(
                'menu_items.id',
                'menu_items.name',
                'menu_items.description',
                'menu_items.price',
                'menu_items.image_url as imageUrl',
                'menu_items.available',
                DB::raw('SUM(order_items.quantity) as total_quantity')
            )
            ->groupBy(
                'menu_items.id',
                'menu_items.name',
                'menu_items.description',
                'menu_items.price',
                'menu_items.image_url',
                'menu_items.available'
            )
            ->orderByDesc('total_quantity')
            ->limit(10)
            ->get();

        if ($topSales->isEmpty()) {
            return response()->json([
                'message' => "There aren't any top selling items available now",
            ], 200);
        }

        return response()->json([
            'data' => $topSales,
        ], 200);
    }

    public function fetchPromotions(): JsonResponse
    {
        $promotions = Promotion::with('promotionMenuItems.menuItem')->get();

        if ($promotions->isEmpty()) {
            return response()->json([
                'message' => "There aren't any promotions available now",
            ], 200);
        }

        // تمثيل البيانات بالشكل المطلوب للفرونت
        $data = $promotions->map(function ($promotion) {
            return [
                'id' => $promotion->id,
                'title' => $promotion->title,
                'discount_percentage' => $promotion->discount_percentage,
                'start_date' => $promotion->start_date,
                'end_date' => $promotion->end_date,
                'description' => $promotion->description,
                'products' => $promotion->promotionMenuItems->map(function ($pmi) {
                    return [
                        'name' => $pmi->menuItem->name,
                        'quantity' => $pmi->quantity
                    ];
                }),

            ];
        });

        return response()->json([
            'data' => $data,
        ], 200);
    }

    /**
     * Creates a new order.
     */
    public function createOrder(Request $request): JsonResponse // 2
    {
        // --- تحقق من حالة النظام أولاً ---
        $employee = auth('user')->user()->employee ?? null;
        $orderControl = $employee
            ? OrderControl::firstOrCreate(['employee_id' => $employee->id], ['status' => 'open'])
            : null;

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
            'note' => 'nullable|string',
            'fulfillmentMethod' => 'required|in:dineIn,takeaway,delivery',
            'scheduledTime' => [
                'nullable',
                'regex:/^(?:[01]\d|2[0-3]):[0-5]\d$/', // HH:mm
            ],
            // في حال كانت delivery
            'address' => 'required_if:pickup_method,delivery|string|max:100',
            'city' => 'required_if:pickup_method,delivery|string|max:100',
            'phone' => 'required_if:pickup_method,delivery|string|max:100',
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
                'pickup_method' => $request->input('fulfillmentMethod'),
                'pickup_time' => $request->input('scheduledTime'),
            ]);

            foreach ($request->items as $item) {
                $menuItem = MenuItem::find($item['menuItem_id']);
                if (! $menuItem || ! $menuItem->available) {
                    throw ValidationException::withMessages([
                        'items' => ['Item "' . ($menuItem?->name ?? 'Unknown') . '" is not available.'],
                    ]);
                }

                $totalPriceForItem = $menuItem->price * $item['quantity'];

                OrderItem::create([
                    'order_id' => $order->id,
                    'menuItem_id' => $menuItem->id,
                    'item_name' => $menuItem->name,
                    'quantity' => $item['quantity'],
                    'price' => $totalPriceForItem,
                ]);
            }

            // في حال delivery: إنشاء سجل في جدول delivery_orders
            if ($request->pickup_method === 'delivery') {
                $deliveryFee = rand(3, 10); // قيمة عشوائية بين 3 و 10
                $etaMinutes = rand(20, 60); // وقت توصيل عشوائي بالدقايق

                DeliveryOrder::create([
                    'delivery_worker_id' => null,
                    'order_id' => $order->id,
                    'status' => 'unassigned',
                    'delivery_fee' => $deliveryFee,
                    'address' => $request->address,
                    'city' => $request->city,
                    'phone' => $request->phone,
                    'pickup_time' => $order->pickup_time,
                    'estimated_time' => now()->addMinutes($etaMinutes),
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Order #' . $order->id . ' created successfully',
            ], 201);

        } catch (Exception $e) {
            DB::rollBack();

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Retrieves orders for the authenticated customer or employee.
     */
    public function getCustomerOrders(): JsonResponse // 3
    {
        $user = auth('user')->user();
        $query = Order::with(['orderItems.menuItem', 'bill']);

        if ($user->role === 'customer') {
            $query->where('customer_id', $user->id);
        }

        $orders = $query->orderByDesc('created_at')->get();

        if ($orders->isEmpty()) {
            return response()->json(['message' => 'No orders found'], 404);
        }

        return response()->json([
            'data' => $orders->map(function ($order) {
                return [
                    'order_id' => $order->id,
                    'status' => $order->status,
                    'created_at' => $order->createdAt,
                    'can_show_bill' => $order->status === 'delivered' && $order->bill !== null,
                    'note' => $order->note ?? '-',
                    'pickup_method' => $order->pickup_method ?? 'dineIn',
                    'pickup_time' => $order->pickup_time ? Carbon::parse($order->pickup_time)->format('h:i A') : 'ASAP',
                    'items' => $order->orderItems->map(function ($item) {
                        return [
                            'item_name' => $item->menuItem->name,
                            'price' => number_format($item->price/$item->quantity, 2),
                            'quantity' => $item->quantity,
                        ];
                    }),
                    'item_count' => $order->orderItems->count(),
                ];
            }),
        ], 200);
    }

    /**
     * Views the bill for a specific order.
     *
     * @param  int  $orderId
     */
    public function viewOrderBill($orderId): JsonResponse // 4
    {
        $user = auth('user')->user();

        $orderQuery = Order::with(['orderItems.menuItem', 'bill', 'customer.user', 'employee.user'])
            ->where('id', $orderId);

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

        return response()->json([
            'message' => "Bill for order #{$order->id}",
            'username' => $username,
            'items' => $order->orderItems->map(function ($item) {
                return [
                    'menu_item' => $item->menuItem->name,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                ];
            }),
            'total_price' => $order->bill->total_amount,
        ]);
    }

    /**
     * Edits an existing order. Supports GET (to show edit interface) and PUT (to update order).
     *
     * @param  int  $orderId
     */
    public function editOrder(Request $request, $orderId): JsonResponse // 5
    {
        // --- تحقق من حالة النظام أولاً ---
        $employee = auth('user')->user()->employee ?? null;
        $orderControl = $employee
            ? OrderControl::firstOrCreate(['employee_id' => $employee->id], ['status' => 'open'])
            : null;

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
                    'name' => $item->menuItem->name,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'formatted' => $item->menuItem->name.' * '.$item->quantity.' ('.number_format($item->price, 2).')',
                    'note' => $item->order->note,
                ];
            });

            return response()->json([
                'order_id' => $order->id,
                'note' => $order->note,
                'items' => $items,
            ]);
        }

        if ($request->isMethod('put')) {
            $validated = $request->validate([
                'items' => 'required|array|min:1',
                'items.*.menuItem_id' => 'required|exists:menu_items,id',
                'items.*.quantity' => 'required|integer|min:0',
                'note' => 'nullable|string',
            ]);

            DB::beginTransaction();

            try {
                foreach ($validated['items'] as $item) {
                    $menuItem = MenuItem::find($item['menuItem_id']);

                    if (! $menuItem->available) {
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
                                'quantity' => $item['quantity'],
                                'price' => $totalPriceForItem,
                            ]
                        );
                    }
                }

                $order->note = $validated['note'] ?? null;
                $order->save();

                DB::commit();

                return response()->json([
                    'message' => 'Order '.$order->id.' updating successfully',
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
    public function cancelOrder($id): JsonResponse // 6
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
    public function confirmOrder($id): JsonResponse // 7
    {
        $user = auth('user')->user();
        $order = Order::with('orderItems.menuItem')->findOrFail($id);

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

            Bill::create([
                'order_id' => $order->id,
                'total_amount' => $totalAmount,
                'date_issued' => now(),
                'payment_method' => 'cash',
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

                Notification::create([
                    'user_id' => $order->customer->id,
                    'sent_by' => 'System',
                    'purpose' => 'Order Ready',
                    'message' => "Your order #{$order->id} is ready now!",
                    'createdAt' => now(),
                ]);
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
    } // 8

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
//                'item_count' => $order->orderItems->count(),
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
    } // 9

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
                    'orderItems' => $order->orderItems->map(function ($item) {
                        return [
                            'item_name' => $item->menuItem->name,
                            'quantity' => $item->quantity,
                        ];
                    }),
                ];
            }),
        ]);
    } // 10

    /**
     * Retrieves a short list of orders for the authenticated customer (ID and status only).
     */
    public function getCustomerOrdersShort(): JsonResponse
    {
        $user = auth('user')->user();

        if ($user->role !== 'customer') {
            return response()->json(['error' => 'Only customers can access this data.'], 403);
        }

        $orders = Order::where('customer_id', $user->id)
            ->orderByDesc('created_at')
            ->get(['id', 'status']);

        return response()->json(['orders' => $orders], 200);
    } // 11

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
    }//12

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
    }//13

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
    }//14

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
    }

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
    }//15

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
    }//16

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

            $formattedTime = \Carbon\Carbon::parse($resumeAt)->format('Y-m-d H:i');
            Notification::create([
                'user_id' => $control->employee_id,
                'sent_by' => 'System',
                'purpose' => 'Orders Controls',
                'message' => "orders controls resumed automatically at {$formattedTime}",
                'createdAt' => now(),
                'seen' => false,
            ]);
        }
    }//17
}
