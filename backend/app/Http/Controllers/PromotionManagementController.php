<?php

namespace App\Http\Controllers;

use App\Http\Requests\PromotionRequest;
use App\Models\MenuItem;
use App\Models\Promotion;
use App\UserRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PromotionManagementController extends Controller
{
    /**
     * Display a listing of promotions managed by the authenticated manager.
     */
    public function index(): JsonResponse
    {
        // احصل على الفاعل: إمّا manager عبر غارد manager، أو user عبر الغارد الافتراضي
        if (Auth::guard('manager')->check()) {
            $actor = Auth::guard('manager')->user();
            $isManager = true;
            $managerId = $actor->id;
        } elseif (auth('user')->check()) {
            $actor = auth('user')->user();
            $isManager = false;
            // السماح فقط اذا الـ user هو employee
            if ($actor->role !== UserRole::Employee->value) {
                abort(403, 'Unauthorized');
            }
            // الموظف من المفترض أن له manager_id
            $managerId = $actor->manager_id;
        } else {
            abort(403, 'Unauthorized');
        }

        // 1. جيب كل العروض مع عناصر جدول الكسر ومنه المنتج
        $promotions = Promotion::with(['promotionMenuItems.menuItem'])
            ->where('manager_id', $managerId)
            ->get(['id', 'title', 'discount_percentage', 'start_date', 'end_date', 'description', 'manager_id']);

        $formattedPromotions = $promotions->map(function ($promotion) {
            return [
                'id' => $promotion->id,
                'title' => $promotion->title,
                'discount_percentage' => $promotion->discount_percentage,
                'start_date' => $promotion->start_date,
                'end_date' => $promotion->end_date,
                'description' => $promotion->description,
                'products' => $promotion->promotionMenuItems->map(function ($pmi) {
                    return [
                        'id' => $pmi->menuItem->id,
                        'name' => $pmi->menuItem->name,
                        'quantity' => $pmi->quantity,
                    ];
                }),
            ];
        });

        // 2. كل المنتجات
        $products = MenuItem::select('id', 'name')->get();

        return response()->json([
            'promotions' => $formattedPromotions,
            'products' => $products,
        ]);
    }

    /**
     * Store a newly created promotion in storage.
     */
    public function store(PromotionRequest $request): JsonResponse
    {
        // تحديد الفاعل/نوعه وmanagerId المرجعي
        if (Auth::guard('manager')->check()) {
            $actor = Auth::guard('manager')->user();
            $isManager = true;
            $managerId = $actor->id;
        } elseif (auth('user')->check()) {
            $actor = auth('user')->user();
            $isManager = false;
            if ($actor->role !== UserRole::Employee->value) {
                abort(403, 'Unauthorized');
            }
            $managerId = $actor->manager_id;
        } else {
            abort(403, 'Unauthorized');
        }

        return DB::transaction(function () use ($request, $managerId) {
            // إنشاء البروموشن
            $promotion = Promotion::create([
                'manager_id'           => $managerId,
                'title'                => $request->title,
                'discount_percentage'  => $request->discount_percentage,
                'start_date'           => $request->start_date,
                'end_date'             => $request->end_date,
                'description'          => $request->description,
            ]);

            // تجهيز الصفوف للجدول الوسيط
            $rows = collect($request->products)->map(fn ($p) => [
                'promotion_id'  => $promotion->id,
                'menu_item_id'  => $p['product_id'],
                'quantity'      => $p['quantity'],
            ])->all();

            // إدراج الصفوف
            DB::table('promotion_menu_item')->insert($rows);

            // تحميل المنتجات مع الكميات
            $promotion->load(['promotionMenuItems.menuItem:id,name']);

            return response()->json([
                'message'   => 'Promotion created successfully.',
                'promotion' => [
                    'id'                  => $promotion->id,
                    'title'               => $promotion->title,
                    'discount_percentage' => $promotion->discount_percentage,
                    'start_date'          => $promotion->start_date,
                    'end_date'            => $promotion->end_date,
                    'description'         => $promotion->description,
                    'products'            => $promotion->promotionMenuItems->map(fn ($pmi) => [
                        'id'       => $pmi->menuItem->id,
                        'name'     => $pmi->menuItem->name,
                        'quantity' => $pmi->quantity,
                    ]),
                ],
            ], 201);
        });
    }

    /**
     * Update the specified promotion in storage.
     *
     * @param  \App\Http\Requests\PromotionRequest  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(PromotionRequest $request, int $id): JsonResponse
    {
        // تحديد الفاعل
        if (Auth::guard('manager')->check()) {
            $actor = Auth::guard('manager')->user();
            $isManager = true;
            $managerId = $actor->id;
        } elseif (auth('user')->check()) {
            $actor = auth('user')->user();
            $isManager = false;
            if ($actor->role !== UserRole::Employee->value) {
                abort(403, 'Unauthorized');
            }
            $managerId = $actor->manager_id;
        } else {
            abort(403, 'Unauthorized');
        }

        $promotion = Promotion::where('id', $id)
            ->where('manager_id', $managerId)
            ->firstOrFail();

        return DB::transaction(function () use ($promotion, $request) {
            // تحديث بيانات البروموشن
            $promotion->update([
                'title'                => $request->title,
                'discount_percentage'  => $request->discount_percentage,
                'start_date'           => $request->start_date,
                'end_date'             => $request->end_date,
                'description'          => $request->description,
            ]);

            // حذف الصفوف القديمة من الجدول الوسيط
            DB::table('promotion_menu_item')->where('promotion_id', $promotion->id)->delete();

            // إعادة إدراج المنتجات الجديدة
            $rows = collect($request->products)->map(fn ($p) => [
                'promotion_id'  => $promotion->id,
                'menu_item_id'  => $p['product_id'],
                'quantity'      => $p['quantity'],
            ])->all();

            DB::table('promotion_menu_item')->insert($rows);

            // تحميل المنتجات الجديدة
            $promotion->load(['promotionMenuItems.menuItem:id,name']);

            return response()->json([
                'message'   => 'Promotion updated successfully.',
                'promotion' => [
                    'id'                  => $promotion->id,
                    'title'               => $promotion->title,
                    'discount_percentage' => $promotion->discount_percentage,
                    'start_date'          => $promotion->start_date,
                    'end_date'            => $promotion->end_date,
                    'description'         => $promotion->description,
                    'products'            => $promotion->promotionMenuItems->map(fn ($pmi) => [
                        'id'       => $pmi->menuItem->id,
                        'name'     => $pmi->menuItem->name,
                        'quantity' => $pmi->quantity,
                    ]),
                ],
            ]);
        });
    }


    /**
     * Remove the specified promotion from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        // تحديد الفاعل
        if (Auth::guard('manager')->check()) {
            $actor = Auth::guard('manager')->user();
            $isManager = true;
            $managerId = $actor->id;
        } elseif (auth('user')->check()) {
            $actor = auth('user')->user();
            $isManager = false;
            if ($actor->role !== UserRole::Employee->value) {
                abort(403, 'Unauthorized');
            }
            $managerId = $actor->manager_id;
        } else {
            abort(403, 'Unauthorized');
        }

        $promotion = Promotion::where('id', $id)
            ->where('manager_id', $managerId)
            ->firstOrFail();

        DB::transaction(function () use ($promotion) {
            // حذف كل صفوف جدول الكسر المرتبطة بهالعرض
            $promotion->promotionMenuItems()->delete();

            // حذف العرض نفسه
            $promotion->delete();
        });

        return response()->json(['message' => 'Promotion deleted successfully.']);
    }

    /**
     * Display all menu items (products)
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

}
