<?php

namespace App\Http\Controllers;

use App\Events\NewNotificationEvent;
use App\Models\InventoryItem;
use App\Models\Notification;
use App\Models\PurchaseBill;
use App\Models\SupplyOffer;
use App\Models\SupplyRequest;
use App\Models\SupplyRequestItem;
use App\Models\User;
use App\UserRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SupplyManagementController extends Controller
{
    /**
     * Display a listing of supply offers with their related data.
     *
     * @return JsonResponse
     */
    public function index()
    {
        $offers = SupplyOffer::with([
            'supplier.user',
            'supplyOfferItems.inventoryItem',
        ])->orderByDesc('created_at')->get();

        $data = $offers->map(function ($offer) {
            return [
                'id' => $offer->id,
                'title' => $offer->title,
                'supplier_name' => $offer->supplier->user->full_name ?? 'Unknown',
                'total_price' => $offer->total_price,
                'delivery_date' => $offer->delivery_date->toDateTimeString(),
                'note' => $offer->note,
                'status' => $offer->status,
                'items' => $offer->supplyOfferItems->map(function ($item) {
                    $itemName = $item->inventoryItem->name ?? $item->name;
                    $itemUnit = $item->inventoryItem->unit ?? $item->unit;

                    return [
                        'item_name' => $itemName,
                        'quantity' => $item->quantity,
                        'unit' => $itemUnit,
                        'unit_price' => $item->unit_price,
                    ];
                }),
            ];
        });

        return response()->json($data);
    }

    /**
     * Get a list of suppliers associated with the authenticated manager.
     */
    public function getSuppliers(): JsonResponse
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

        // جلب الموردين الذين أنشأهم هذا المدير والمرتبطين بجدول users
        $suppliers = User::where('role', 'supplier')
            ->where('manager_id', $managerId)
            ->select('id', 'full_name')
            ->get();

        return response()->json($suppliers);
    }

    /**
     * Accept a pending supply offer.
     *
     * @param  int  $id
     * @return JsonResponse
     */
    public function acceptOffer($id)
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

        $supplyOffer = SupplyOffer::with('supplier.user', 'supplyOfferItems.inventoryItem')->findOrFail($id);

        if ($supplyOffer->status !== 'pending') {
            return response()->json(['message' => 'This offer has already been processed.'], 400);
        }

        $supplyOffer->status = 'accepted';
        $supplyOffer->save();

        $notification = Notification::create([
            'manager_id' => $managerId,
            'user_id' => $supplyOffer->supplier_id,
            'sent_by' => 'manager',
            'purpose' => 'Supply Offer Response',
            'message' => "'{$supplyOffer->title}' Offer has been accepted",
            'createdAt' => now(),
            'seen' => false,
        ]);
        event(new NewNotificationEvent($notification));
        return response()->json(['message' => 'Supply offer accepted and waiting to pay the bill.']);
    }

    /**
     * Reject a pending supply offer.
     *
     * @param  int  $id
     * @return JsonResponse
     */
    public function rejectOffer(Request $request, $id)
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

        $supplyOffer = SupplyOffer::with('supplier.user', 'supplyOfferItems.inventoryItem')->findOrFail($id);

        $request->validate([
            'reason' => 'nullable|string|max:1000',
        ]);

        if ($supplyOffer->status !== 'pending') {
            return response()->json(['message' => 'This offer has already been processed.'], 400);
        }

        $supplyOffer->status = 'rejected';
        $supplyOffer->reject_reason = $request->reason ?? 'Rejected without reason';
        $supplyOffer->save();

        $notification = Notification::create([
            'manager_id' => $managerId,
            'user_id' => $supplyOffer->supplier_id,
            'sent_by' => 'manager',
            'purpose' => 'Supply Offer Response',
            'message' => "Offer '{$supplyOffer->title}' has been rejected\nReason: {$supplyOffer->reject_reason}",
            'createdAt' => now(),
            'seen' => false,
        ]);
        event(new NewNotificationEvent($notification));
        return response()->json(['message' => 'Supply offer rejected successfully.']);
    }

    /**
     * Store a new supply request.
     */
    public function store(Request $request): JsonResponse
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
        $validated = $request->validate([
            'supplier_id' => 'required|exists:users,id',
            'title' => 'required|string',
            'note' => 'nullable|string',
            'items' => 'required|array',
            'items.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'items.*.quantity' => 'required|integer|min:0',
        ]);

        $validItems = collect($validated['items'])->filter(function ($item) {
            return $item['quantity'] > 0;
        });

        if ($validItems->isEmpty()) {
            return response()->json([
                'message' => 'Please enter quantity for at least one item.',
            ], 422);
        }

        $supplyRequest = SupplyRequest::create([
            'manager_id' => $managerId,
            'supplier_id' => $validated['supplier_id'],
            'title' => $validated['title'],
            'request_date' => now(),
            'note' => $validated['note'],
            'status' => 'pending',
        ]);

        foreach ($validItems as $item) {
            SupplyRequestItem::create([
                'supplyRequest_id' => $supplyRequest->id,
                'inventory_item_id' => $item['inventory_item_id'],
                'quantity' => $item['quantity'],
            ]);
        }

        $notification = Notification::create([
            'manager_id' => $managerId,
            'user_id' => $validated['supplier_id'],
            'supplyRequest_id' => $supplyRequest->id,
            'sent_by' => 'manager',
            'purpose' => 'Supply Request',
            'message' => "You have received a new supply request: '{$supplyRequest->title}'",
            'createdAt' => now(),
            'seen' => false,
        ]);
        event(new NewNotificationEvent($notification));

        return response()->json([
            'message' => 'Supply request sent successfully.',
            'supply_request_id' => $supplyRequest->id,
        ]);
    }

    public function show(string $id) {}

    public function update(Request $request, string $id) {}

    public function destroy(string $id) {}
}
