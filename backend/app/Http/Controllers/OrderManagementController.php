<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\MenuItem;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class OrderManagementController extends Controller
{
    public function fetchMenuItems(Request $request): JsonResponse //1
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
                ];
            }),
        ], 200);
    }

    public function createOrder(Request $request): JsonResponse //2
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.menuItem_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'note' => 'nullable|string',
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
            ]);

            foreach ($request->items as $item) {
                $menuItem = MenuItem::find($item['menuItem_id']);
                if (! $menuItem || ! $menuItem->available) {
                    throw ValidationException::withMessages([
                        'items' => ['Item "'.$menuItem->name.'" is not available.'],
                    ]);
                }

                $totalPriceForItem = $menuItem->price * $item['quantity'];

                OrderItem::create([
                    'order_id' => $order->id,
                    'menuItem_id' => $menuItem->id,
                    'quantity' => $item['quantity'],
                    'price' => $totalPriceForItem,
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Order #'.$order->id.' created successfully',
            ], 201);

        } catch (Exception $e) {
            DB::rollback();

            return response()->json([$e], 500);
        }
    }

    public function getCustomerOrders(): JsonResponse //3
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
                    'created_at' => $order->created_at,
                    'can_show_bill' => $order->status === 'delivered' && $order->bill !== null,
                    'note' => $order->note ?? '-',
                    'item_count' => $order->orderItems->count(),
                ];
            }),
        ], 200);
    }

    public function viewOrderBill($orderId): JsonResponse //4
    {
        $user = auth('user')->user();

        $orderQuery = Order::with(['orderItems.menuItem', 'bill', 'customer.user', 'employee.user'])
                    ->where('id', $orderId);

        if ($user->role === 'customer') {
            $customerId = optional($user->customer)->id;
            $orderQuery->where('customer_id', $customerId);
        }

        // مافي شرط إضافي للموظف: بيشوف أي فاتورة لأي طلب

        $order = $orderQuery->first();

        if (! $order) {
            return response()->json(['message' => "Order isn't existed or unavailable"], 404);
        }

        if ($order->status !== 'delivered') {
            return response()->json(['message' => "Order isn't delivered yet ,can't show invoice now "], 403);
        }

        if ($order->employee_id) {
            $username = optional($order->employee)->user->name ?? 'Unknown Employee';
        } elseif ($order->customer_id) {
            $username = optional($order->customer)->user->name ?? 'Unknown Customer';
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

    public function editOrder(Request $request, $orderId): JsonResponse //5
    {
        $user = auth('user')->user();
        $column = $user->role === 'employee' ? 'employee_id' : 'customer_id';

        $query = Order::with('orderItems.menuItem')
            ->where('id', $orderId)
            ->where('status', 'pending');

        if ($user->role !== 'employee') {
            $query->where('customer_id', $user->id); // فقط الزبون نتحقق إنه صاحب الطلب
        }

        $order = $query->first();


        if (! $order && $user->role !== 'employee') {
            return response()->json([
                'message' => 'Can only edit unconfirmed orders or this order not yours',
            ], 403);
        }
        // here you can get the order edit interface like you view it in react.
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

    public function cancelOrder($id): JsonResponse //6
    {
        $user = auth('user')->user();
        $order = Order::with(['employee.user', 'customer.user'])->findOrFail($id);

        if ($order->confirmed_at !== null) {
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

    public function confirmOrder($id): JsonResponse //7
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

        if (! $hasPermission) {
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
                $notificationMessage .= "- {$item->menuItem->name} (Qty: {$item->quantity}, Price: $" . number_format($item->price, 2) . ")\n";
            }

            $notificationMessage .= "Total Amount: $" . number_format($totalAmount, 2);
            $notificationMessage .= "\nNote: " . ($order->note ?? 'N/A');

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


    //----------------------------------------------------Employee Only---------------------------------------------------//

    public function updateOrderStatus(Request $request, $orderId): JsonResponse
    {
        $employee = auth('user')->user();

        $order = Order::with('customer', 'employee')->findOrFail($orderId);

        $current = $order->status;
        $new = $request->input('status');

        if ($current === 'pending') {
            return response()->json(['error' => 'Cannot update status before confirmation'], 403);
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
                'status' => 'Order status updated successfully.',
                'order' => $order,
                'notifiedCustomer' => ! $isEmployeeCreator,
            ]);
        }

        return response()->json([
            'error' => 'Invalid status transition.',
        ], 403);
    } //8

    public function searchOrder(Request $request): JsonResponse
    {
        $orderId = $request->query('order_id');
        $statuses = $request->query('statuses');

        $query = Order::with('orderItems', 'customer', 'employee')
              ->where('id', $orderId);

        if($statuses) {
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
                'created_at' => $order->created_at,
                'status' => $order->status,
                'note' => $order->note ?? '-',
                'item_count' => $order->orderItems->count(),
            ],
        ]);
    } //9

    public function getKitchenOrders(): JsonResponse
    {
        $orders = Order::with(['orderItems.menuItem', 'customer', 'employee'])
            ->whereIn('status', ['confirmed', 'preparing', 'ready', 'delivered'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $orders->map(function ($order) {
                return [
                    'order_id' => $order->id,
                    'status' => $order->status,
                    'orderItems' => $order->orderItems->map(function ($item) {
                        return [
                            'item_name' => $item->menuItem->name,
                            'quantity' => $item->quantity,
                        ];
                    }),
                ];
            }),
        ]);
    } //10

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
    } //11
}
