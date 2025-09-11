<?php

namespace App\Http\Controllers;

use App\Models\FavoriteItem;
use App\Models\MenuItem;
use App\Models\Promotion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MenuSectionController extends Controller
{
    public function fetchMenuItems(Request $request): JsonResponse // 1
    {
        $customerId = auth('user')->id();

        // جلب جميع عناصر المفضلة للمستخدم الحالي
        $favoriteIds = FavoriteItem::where('customer_id', $customerId)
            ->pluck('menu_item_id') // ناخد فقط menu_item_id
            ->toArray();

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
            'data' => $menuItems->map(function ($item) use ($favoriteIds) {
                return [
                    'id' => $item->id,
                    'image' => $item->image_url,
                    'name' => $item->name,
                    'description' => $item->description,
                    'price' => $item->price,
                    'category' => $item->category->name,
                    'available' => $item->available,
                    'isFavorite' => in_array($item->id, $favoriteIds),
                ];
            }),
        ], 200);
    }

    public function fetchTopSales(Request $request): JsonResponse //2
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

    public function fetchPromotions(): JsonResponse //3
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

    public function latestPromotion()
    {
        $promotion = Promotion::latest('created_at')->first();
        return response()->json([
            'id' => $promotion?->id,
            'title' => $promotion?->title,
            'created_at' => $promotion?->created_at,
        ]);
    }
}
