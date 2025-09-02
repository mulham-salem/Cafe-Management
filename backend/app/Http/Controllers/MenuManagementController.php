<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class MenuManagementController extends Controller
{
    protected array $allowedNames = [
        // Drinks
        'Espresso',
        'Cappuccino',
        'Iced Coffee',
        'Green Tea',
        'Hot Chocolate',
        'Fresh Orange Juice',
        'Lemon Mint Juice',
        'Vanilla Milkshake',
        'Chocolate Milkshake',
        'Strawberry Milkshake',
        'Vienna Coffee',
        'Caramel Mocha Smoothie',

        // Snacks
        'Cheese Croissant',
        'Chocolate Croissant',
        'Blueberry Muffin',
        'Chocolate Chip Muffin',
        'Turkey Sandwich',
        'Cheese Sandwich',
        'Mini Pizza',
        'Donut',
        'French Fries',
        'Nachos with Cheese',
        'Chocolate & Strawberry Waffle',
        'Mint Chocolate Mousse',
    ];

    /**
     * Display a listing of menu items managed by the authenticated manager.
     */
    public function index(): JsonResponse
    {
        $managerId = auth('manager')->id();

        $menuItems = MenuItem::with('category:id,name')
            ->where('manager_id', $managerId)
            ->get();

        $formattedMenuItems = $menuItems->map(function ($item) {
            return [
                'id' => $item->id,
                'name' => $item->name,
                'description' => $item->description,
                'price' => $item->price,
                'category_name' => $item->category->name,
                'image_url' => $item->image_url,
                'available' => $item->available,
            ];
        });

        return response()->json($formattedMenuItems);
    }

    /**
     * Store a newly created menu item in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', Rule::in($this->allowedNames)],
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category' => ['required', Rule::in(['drinks', 'snacks'])],
            'image_url' => 'nullable',
            'available' => 'boolean',
        ]);

        $categoryId = $validated['category'] === 'drinks' ? 1 : 2;

        MenuItem::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? '',
            'price' => $validated['price'],
            'category_id' => $categoryId,
            'manager_id' => auth('manager')->id(),
            'image_url' => $validated['image_url'] ?? null,
            'available' => $validated['available'] ?? true,
        ]);

        return response()->json(['message' => 'Menu item created successfully'], 201);
    }

    /**
     * Display the specified menu item.
     *
     * @param  int  $id
     */
    public function show($id): JsonResponse
    {
        $menuItem = MenuItem::with('category')->find($id);

        if (! $menuItem) {
            return response()->json([
                'message' => 'Menu item not found',
            ], 404);
        }

        return response()->json([
            'name' => $menuItem->name,
            'description' => $menuItem->description,
            'price' => $menuItem->price,
            'category_name' => $menuItem->category->name ?? null,
            'image_url' => $menuItem->image_url,
            'available' => $menuItem->available,
            'manager_id' => $menuItem->manager_id,
            'created_at' => $menuItem->created_at,
            'updated_at' => $menuItem->updated_at,
        ]);
    }

    /**
     * Update the specified menu item in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', Rule::in($this->allowedNames)],
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category' => ['required', Rule::in(['drinks', 'snacks'])],
            'image_url' => 'nullable',
            'available' => 'boolean',
        ]);

        $menuItem = MenuItem::findOrFail($id);

        $categoryId = $validated['category'] === 'drinks' ? 1 : 2;

        $menuItem->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? '',
            'price' => $validated['price'],
            'category_id' => $categoryId,
            'manager_id' => auth('manager')->id(),
            'image_url' => $validated['image_url'] ?? null,
            'available' => $validated['available'] ?? true,
        ]);

        return response()->json(['message' => 'Menu item updated successfully.', 'data' => $menuItem]);
    }

    /**
     * Remove the specified menu item from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $menuItem = MenuItem::findOrFail($id);

        $activeOrders = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('order_items.menuItem_id', $id)
            ->where('orders.status', '!=', 'delivered')
            ->exists();

        if ($activeOrders) {
            return response()->json([
                'message' => 'Failed to remove item. Because this item used in an active order',
            ], 403);
        }

        $menuItem->delete();

        return response()->json(['message' => 'Menu item deleted successfully.']);
    }
}
