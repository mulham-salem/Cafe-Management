<?php

namespace App\Http\Controllers;

use App\Models\FavoriteItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FavoriteController extends Controller
{
    /**
     * Add a menu item to the customer's favorites.
     */
    public function store(Request $request)
    {
        $request->validate([
            'item_id' => 'required|exists:menu_items,id',
        ]);

        $customerId = Auth::id();
        $menuItemId = $request->item_id;

        // Check if already exists
        $exists = FavoriteItem::where('customer_id', $customerId)
            ->where('menu_item_id', $menuItemId)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Item already in favorites.',
            ], 200);
        }

        $favorite = FavoriteItem::create([
            'customer_id' => $customerId,
            'menu_item_id' => $menuItemId,
            'added_at' => now(),
        ]);

        return response()->json([
            'message' => 'Item added to favorites successfully!',
            'data' => $favorite,
        ], 201);
    }

    /**
     * Remove a menu item from the customer's favorites.
     */
    public function destroy($menuItemId)
    {
        $customerId = Auth::id();

        $favorite = FavoriteItem::where('customer_id', $customerId)
            ->where('menu_item_id', $menuItemId)
            ->first();

        if (! $favorite) {
            return response()->json(['message' => 'Favorite item not found'], 404);
        }

        $favorite->delete();

        return response()->json(['message' => 'Item removed from favorites successfully!'], 200);
    }

    /**
     * Get all favorites for the current customer.
     */
    public function favorites()
    {
        $customerId = Auth::id();

        $favorites = FavoriteItem::with(['menuItem.category'])
            ->where('customer_id', $customerId)
            ->get();

        return response()->json([
            'data' => $favorites->map(function ($fav) {
                $item = $fav->menuItem;

                return [
                    'id' => $item->id,
                    'imageUrl' => $item->image_url,
                    'name' => $item->name,
                    'description' => $item->description,
                    'price' => $item->price,
                    'category' => $item->category->name ?? null,
                    'available' => $item->available,
                    'isFavorite' => true,
                ];
            }),
        ]);
    }
}
