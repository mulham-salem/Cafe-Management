<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\MenuItem;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EmployeeController extends Controller
{
    public function kitchen(Request $request, $orderId = null)
    {
        $employee = auth('user')->user();

        if ($orderId) {
            $order = Order::with('customer')->findOrFail($orderId);

            $current = $order->status;
            $new = $request->input('status');

            if ($current == 'pending') {
                return response()->json(['error' => 'Connot move to this status before complete the previous one'], 403);
            }

            if ($current == 'preparing' && $new == 'ready') {
            } elseif ($current == 'ready' && $new == 'delivered') {
            } else {
                return response()->json(['error' => 'Connot update status before p'], 403);
            }

            $order->status = $new;
            $order->save();

            if ($new == 'ready') {
                Notification::create([
                    'user_id' => $employee->id,
                    'sent_by' => 'System',
                    'purpose' => 'orderReady',
                    'message' => "The customer has been notified that the order {$order->id} is ready.",
                    'created_at' => now(),
                ]);

                Notification::create([
                    'user_id' => $order->customer->id,
                    'sent_by' => 'System',
                    'purpose' => 'orderReadyToCustomer',
                    'message' => "Your order {$order->id} is ready for delivery.",
                    'created_at' => now(),
                ]);
            }

            return response()->json([
                'status' => 'Order Status has been changed',
                'order' => $order,
            ]);
        }

        if ($searchId = $request->query('orderId')) {
            $order = Order::with(['orderItems.menuItem', 'customer'])
                ->find($orderId);

            if (! $order) {
                return response()->json(['error' => 'Didnot find order with this id '], 404);
            }

            return response()->json([
                'data' => [
                    'order_id' => $order->id,
                    'status' => $order->status,
                    'orderItems' => $order->orderItems->map(function ($item) {
                        return [
                            'item_name' => $item->menuItem->name,
                            'quantity' => $item->quantity,
                            'price' => $item->price,
                        ];
                    }),
                ],
            ]);
        }

        $orders = Order::with(['orderItems.menuItem', 'customer'])

            ->whereIn('status', ['confirmed', 'preparing', 'ready'])

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
                            'price' => $item->price,
                        ];
                    }),
                ];
            }),
        ]);
    }
        //    ................................................................................................................................................

    public function index(Request $request)
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
                    'image' => $item->image,
                    'name' => $item->name,
                    'description' => $item->description,
                    'price' => $item->price,
                ];
            }),
        ], 200);
    }
    //    ................................................................................................................................................

    public function index2()
    {
        $employee = auth('user')->user();

        $orders = Order::with(['orderItems.menuItem', 'bill'])
            ->where('employee_id', $employee->id)
            ->orderByDesc('created_at')
            ->get();

        if ($orders->isEmpty()) {
            return response()->json(['message' => 'No orders found'], 404);
        }

        return response()->json([
            'data' => $orders->map(function ($order) {
                return [
                    'order_id' => $order->id,
                    'status' => $order->status,
                    'created_at' => $order->created_at->toDateTimeString(),
                    'can_show_bill' => $order->status === 'delivered' && $order->bill !== null,
                ];
            }),
        ], 200);
    }
    //    ................................................................................................................................................

    public function index3($orderId)
    {
        $employee = auth('user')->user();

        $order = Order::with(['orderItems.menuItem', 'bill'])
            ->where('id', $orderId)
            ->where('employee_id', $employee->id)
            ->first();

        if (! $order) {
            return response()->json(['message' => "Order isn't existed or unavailable"], 404);
        }

        if ($order->status !== 'delivered') {
            return response()->json(['message' => "Order isn't delivered yet ,can't show invoice now "], 403);
        }

        return response()->json([
            'message' => "Bill for order #{$order->id}",
            'customer' => $order->employee->name ?? 'Unknown',
            'items' => $order->orderItems->map(function ($item) {
                return [
                    'menu_item' => $item->menuItem->name,
                    'quantity' => $item->quantity,
                    'price' => $item->quantity * $item->unit_price,
                ];
            }),
            'total_price' => $order->bill->total_price,
        ]);
    }
    //    ................................................................................................................................................

    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'note' => 'nullable|string',
        ]);

        $employee = auth('user')->user();

        DB::beginTransaction();

        try {
            $order = Order::create([
                'customer_id' => $employee->id,
                'status' => 'pending',
                'createdAt' => now(),
                'confirmedAt' => null,
                'note' => $request->input('note'),
            ]);

            foreach ($request->items as $item) {
                $menuItem = MenuItem::find($item['menu_item_id']);
                if (! $menuItem || ! $menuItem->available) {
                    throw ValidationException::withMessages([
                        'items' => ['Item "'.$menuItem->name.'" is not available.'],
                    ]);
                }

                OrderItem::create([
                    'order_id' => $order->id,
                    'menuItem_id' => $menuItem->id,
                    'quantity' => $item['quantity'],
                    'price' => $menuItem->price,
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Order #'.$order->id.'created succesfully #',
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();

            return response()->json(['error' => 'error happend while creating the order'], 500);
        }
    }
    //    ................................................................................................................................................

    // get the edit order interface then you can either edit quantity and remove a menu item by reducing the quantity to zero or add new item
    public function editOrUpdateOrder(Request $request, $orderId)
    {
        $user = auth('user')->user();

        $order = Order::with('orderItems.menuItem')
            ->where('id', $orderId)
            ->where('customer_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if (! $order) {
            return response()->json([
                'message' => 'Can only edit unconfirmed orders or this order not yours',
            ], 403);
        }
        // here you can get the order edit interface like you view it in react..
        if ($request->isMethod('get')) {
            $items = $order->orderItems->map(function ($item) {
                return [
                    'menu_item_id' => $item->menu_item_id,
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
                'items.*.menu_item_id' => 'required|exists:menu_items,id',
                'items.*.quantity' => 'required|integer|min:0',
                'note' => 'nullable|string',
            ]);

            DB::beginTransaction();

            try {
                foreach ($validated['items'] as $item) {
                    $menuItem = MenuItem::find($item['menu_item_id']);

                    if (! $menuItem->available) {
                        throw ValidationException::withMessages([
                            'menu_item_id' => "item {$menuItem->name} unavilable now",
                        ]);
                    }

                    if ($item['quantity'] < 1) {
                        OrderItem::where('order_id', $order->id)
                            ->where('menu_item_id', $item['menu_item_id'])
                            ->delete();
                    } else {

                        OrderItem::updateOrCreate(
                            [
                                'order_id' => $order->id,
                                'menu_item_id' => $item['menu_item_id'],
                            ],
                            [
                                'quantity' => $item['quantity'],
                                'price' => $menuItem->price,
                            ]
                        );
                    }
                }

                $order->note = $validated['note'] ?? null;
                $order->save();

                DB::commit();

                return response()->json([
                    'message' => 'Order '.$order->id.' created succesfully',
                ]);
            } catch (\Exception $e) {
                DB::rollBack();

                return response()->json([
                    'message' => 'Failed editing the order',
                    'error' => $e->getMessage(),
                ], 500);
            }
        }

        return response()->json([
            'message' => 'Unvalid Request',
        ], 405);
    }
    //    ................................................................................................................................................

    public function cancel($id)
    {
        $user = auth('user')->user();
        $order = Order::with('employee.user')->findOrFail($id);

        if ($order->confirmed_at !== null) {
            return response()->json([
                'message' => "Can't be deleted after confirming it or preparing ",
            ], 403);
        }

        if ($user->role === 'employee') {
            if ($order->employee->id !== $user->id) {
                return response()->json([
                    'message' => "Don't have the permission to delete it ",
                ], 403);
            }
        }
        // we could put employee

        $order->delete();

        return response()->json([
            'message' => ' Order deleted succesfully',
        ]);
    }

    public function confirm(Request $request, $id)
    {
        $user = auth('user')->user();
        $order = Order::with('orderItems.menuItem')->findOrFail($id);

        if ($order->confirmed_at !== null) {
            return response()->json([
                'message' => 'Order is already confirmed!',
            ], 422);
        }

        if ($user->role === 'employee' && $order->employee_id !== $user->id) {
            return response()->json(['message' => 'No permission to confirm'], 403);
        }

        if ($order->orderItems->isEmpty()) {
            return response()->json(['message' => 'order is empty!'], 422);
        }

        DB::beginTransaction();
        try {
            $order->update([
                'confirmed_at' => now(),
                'status' => 'processing',
            ]);

            $total = 0;
            foreach ($order->orderItems as $item) {
                $total += $item->quantity * $item->menuItem->price;
            }

            Bill::create([
                'order_id' => $order->id,
                'total' => $total,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Order confirmed succesfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'an error happened !',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
