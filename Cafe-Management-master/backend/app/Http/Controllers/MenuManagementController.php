<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MenuManagementController extends Controller
{
    
    public function index()
    {
        //
    }

        // ...............................................................Store..................................................................

    public function store(Request $request)
    {
          $allowedNames = [
        // Drinks
        'Espresso',
        'Cappuccino',
        'Iced Coffee',
        'Green Tea',
        'Hot Chocolate',
        'Fresh Orange Juice',
        'Lemon Mint Juice',
        'Milkshake (Vanilla / Chocolate / Strawberry)',
        'Vienna Coffee',
        'Caramel Mocha Smoothie',

        // Snacks
        'Croissant (Cheese / Chocolate)',
        'Muffin (Blueberry / Chocolate Chip)',
        'Sandwich (Turkey / Cheese)',
        'Mini Pizza',
        'Donut',
        'French Fries',
        'Nachos with Cheese',
        'Chocolate & strawberry waffle',
        'Minit Chocolate Mousse',
    ];

    $validated = $request->validate([
        'name' => ['required', Rule::in($allowedNames)],
        'description' => 'nullable|string',
        'price' => 'required|numeric|min:0',
        'category' => ['required', Rule::in(['drinks', 'snacks'])],
        'image_url' => 'nullable|url',
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

           // ...............................................................Show................................................................

public function show($id)
{
    $menuItem = MenuItem::with('category')->find($id);

    if (!$menuItem) {
        return response()->json([
            'message' => 'Menu item not found'
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


       // ...............................................................Update.................................................................

    public function update(Request $request, string $id)
    {
         $allowedNames = [
        // Drinks
        'Espresso',
        'Cappuccino',
        'Iced Coffee',
        'Green Tea',
        'Hot Chocolate',
        'Fresh Orange Juice',
        'Lemon Mint Juice',
        'Milkshake (Vanilla / Chocolate / Strawberry)',
        'Vienna Coffee',
        'Caramel Mocha Smoothie',

        // Snacks
        'Croissant (Cheese / Chocolate)',
        'Muffin (Blueberry / Chocolate Chip)',
        'Sandwich (Turkey / Cheese)',
        'Mini Pizza',
        'Donut',
        'French Fries',
        'Nachos with Cheese',
        'Chocolate & strawberry waffle',
        'Minit Chocolate Mousse',
    ];
         $validated = $request->validate([
        'name' => ['required', Rule::in($allowedNames)],
        'description' => 'nullable|string',
        'price' => 'required|numeric|min:0',
        'category' => ['required', Rule::in(['drinks', 'snacks'])],
        'image_url' => 'nullable|url',
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

    // ...............................................................Delete..................................................................
    public function destroy(string $id)
    {
     
    $menuItem = MenuItem::findOrFail($id);
// .................................................................للتدفق البديل المنتاك ....................................................
    // $activeOrders = \DB::table('order_items')
    //     ->join('orders', 'order_items.order_id', '=', 'orders.id')
    //     ->where('order_items.menu_item_id', $id)
    //     ->where('orders.status', '!=', 'completed')
    //     ->exists();

    // if ($activeOrders) {
    //     return response()->json([
    //         'message' => 'لا يمكن حذف عنصر مستخدم في طلبات نشطة'
    //     ], 403);
    // }

    $menuItem->delete();

    return response()->json(['message' => 'تم حذف العنصر بنجاح']);
}

    }

