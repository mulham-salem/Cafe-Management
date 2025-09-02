<?php

namespace App\Http\Controllers;

use App\Http\Requests\PromotionRequest;
use App\Models\MenuItem;
use App\Models\Promotion;
use Illuminate\Http\JsonResponse;

class PromotionManagementController extends Controller
{
    /**
     * Display a listing of promotions managed by the authenticated manager.
     */
    public function index(): JsonResponse
    {
        $managerId = auth('manager')->id();

        $promotions = Promotion::with(['menuItems:id,name,promotion_id'])
            ->where('manager_id', $managerId)
            ->get(['id', 'title', 'discount_percentage', 'start_date', 'end_date', 'description', 'manager_id']);

        $formatted = $promotions->map(function ($promotion) {
            return [
                'id' => $promotion->id,
                'title' => $promotion->title,
                'discount_percentage' => $promotion->discount_percentage,
                'start_date' => $promotion->start_date,
                'end_date' => $promotion->end_date,
                'description' => $promotion->description,
                'products' => $promotion->menuItems->pluck('name'),
            ];
        });

        return response()->json($formatted);
    }

    /**
     * Store a newly created promotion in storage.
     */
    public function store(PromotionRequest $request): JsonResponse
    {
        $managerId = auth('manager')->id();

        $productIds = MenuItem::where('manager_id', $managerId)
            ->whereIn('name', $request->product_names)
            ->pluck('id')
            ->toArray();

        $promotion = Promotion::create([
            'manager_id' => $managerId,
            'title' => $request->title,
            'discount_percentage' => $request->discount_percentage,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'description' => $request->description,
        ]);

        MenuItem::whereIn('id', $productIds)
            ->update(['promotion_id' => $promotion->id]);

        return response()->json([
            'message' => 'Promotion created successfully.',
            'promotion' => $promotion,
            'products' => $request->product_names,
        ], 201);
    }

    /**
     * Display the specified promotion.
     */
    public function show(string $id): JsonResponse
    {
        $promotion = Promotion::with(['menuItems:id,name,promotion_id'])
            ->where('id', $id)
            ->where('manager_id', auth('manager')->id())
            ->firstOrFail(['id', 'title', 'discount_percentage', 'start_date', 'end_date', 'description', 'manager_id']);

        return response()->json([
            'id' => $promotion->id,
            'title' => $promotion->title,
            'discount_percentage' => $promotion->discount_percentage,
            'start_date' => $promotion->start_date,
            'end_date' => $promotion->end_date,
            'description' => $promotion->description,
            'products' => $promotion->menuItems->pluck('name'),
        ]);
    }

    /**
     * Update the specified promotion in storage.
     *
     * @param  mixed  $id
     */
    public function update(PromotionRequest $request, $id): JsonResponse
    {
        $promotion = Promotion::findOrFail($id);
        $managerId = auth('manager')->id();

        $productIds = MenuItem::where('manager_id', $managerId)
            ->whereIn('name', $request->product_names)
            ->pluck('id')
            ->toArray();

        $promotion->update([
            'title' => $request->title,
            'discount_percentage' => $request->discount_percentage,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'description' => $request->description,
        ]);

        MenuItem::where('promotion_id', $promotion->id)
            ->update(['promotion_id' => null]);

        MenuItem::whereIn('id', $productIds)
            ->update(['promotion_id' => $promotion->id]);

        return response()->json([
            'message' => 'Promotion updated successfully.',
            'promotion' => $promotion,
            'products' => $request->product_names,
        ]);
    }

    /**
     * Remove the specified promotion from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $promotion = Promotion::where('id', $id)
            ->where('manager_id', auth('manager')->id())
            ->firstOrFail();

        MenuItem::where('promotion_id', $promotion->id)->update(['promotion_id' => null]);

        $promotion->delete();

        return response()->json(['message' => 'Promotion deleted successfully.']);
    }
}
