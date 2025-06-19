<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationManagementController extends Controller
{
    //    ....................................................manager notification.......................................................................
    public function getAllManagerNotifications(): JsonResponse
    {
        $managerId = auth('manager')->id();

                   // النوع 1: عروض الموردين
        $offerNotifications = Notification::where('manager_id', $managerId)
            ->where('sent_by', 'supplier')
            ->where('purpose', 'Supply Offer')
            ->with('user')
            ->orderByDesc('createdAt')
            ->get();

        // النوع 2: ردود الموردين على الطلبات
        $responseNotifications = Notification::where('manager_id', $managerId)
            ->where('sent_by', 'supplier')
            ->where('purpose', 'Response For Supply Request')
            ->with('user') // منشان نجيب اسم المورد
            ->orderByDesc('createdAt')
            ->get();

        // النوع 3: إشعارات عامة للمدير (بدون علاقات)
        $generalNotifications = Notification::where('manager_id', $managerId)
            ->whereNull('user_id')
            ->whereNull('supplyRequest_id')
            ->orderByDesc('createdAt')
            ->with('user')
            ->get();

        // دمج الكل وتنسيقهم
        $formatted = collect()
            ->merge($offerNotifications)
            ->merge($responseNotifications)
            ->merge($generalNotifications)
            ->sortByDesc('createdAt') // ترتيب نهائي مشترك
            ->values()
            ->map(function ($notification) {
                $data = [
                    'id' => $notification->id,
                    'message' => $notification->message,
                    'seen' => $notification->seen,
                    'createdAt' => $notification->createdAt,
                    'purpose' => $notification->purpose,
                ];

                // اسم المرسل
                if ($notification->sent_by === 'system') {
                    $data['sent_by'] = 'System';
                } elseif ($notification->sent_by === 'supplier' && $notification->user) {
                    $data['sent_by'] = $notification->user->name;
                } else {
                    $data['sent_by'] = 'Unknown';
                }
                return $data;
            });

        return response()->json([
            'notifications' => $formatted,
        ]);
    }

    //    ....................................................supplier notification.......................................................................

    public function getAllSupplierNotifications(): JsonResponse
    {
        $supplier = auth('user')->user();

        $offerResponses = Notification::where('user_id', $supplier->id)
            ->with('manager')
            ->where('sent_by', 'manager')
            ->where('purpose', 'Supply Offer Response')
            ->whereIn('manager_id', [1, 2])
            ->orderByDesc('createdAt')
            ->get()
            ->map(function ($notification) {
                $data = [
                    'id' => $notification->id,
                    'message' => $notification->message,
                    'seen' => $notification->seen,
                    'createdAt' => $notification->createdAt,
                    'purpose' => $notification->purpose,
                    'sent_by' => $notification->manager->name,
                ];
                return $data;
            })
        ->toArray(); // نحوله لـ array عادي

        $supplyRequests = Notification::where('user_id', $supplier->id)
            ->where('sent_by', 'manager')
            ->where('purpose', 'Supply Request')
            ->with(['supplyRequest.supplyRequestItems.inventoryItem', 'supplyRequest.manager', 'manager', 'user'])
            ->orderByDesc('createdAt')
            ->get()
            ->map(function ($notification) {
                $data = [
                    'id' => $notification->id,
                    'message' => $notification->message,
                    'seen' => $notification->seen,
                    'createdAt' => $notification->createdAt,
                    'purpose' => $notification->purpose,
                    'sent_by' => $notification->manager->name,
                    'status' => optional($notification->supplyRequest)->status,
                    'note' => optional($notification->supplyRequest)->note,
                    'rejection_reason' => optional($notification->supplyRequest)->rejection_reason,
                    'items' => optional($notification->supplyRequest)->supplyRequestItems->map(function ($item) {
                        return [
                            'name' => $item->inventoryItem->name ?? 'Unknown Item',
                            'quantity' => $item->quantity,
                        ];
                    }),
                ];
                return $data;
            })
            ->toArray(); // نحوله لـ array عادي

        // دمج كل الإشعارات في Collection واحدة
        $allNotifications =collect(array_merge($offerResponses, $supplyRequests))
            ->sortByDesc('createdAt')
            ->values(); // إعادة ترتيب الفهرسة

        return response()->json([
            'notifications' => $allNotifications,
        ]);
    }

    public function respondToSupplyRequestNotification(Request $request, $notificationId): JsonResponse
    {
        $request->validate([
            'response' => 'required|in:accepted,rejected',
            'rejection_reason' => 'nullable|string|max:500',
        ]);

        $supplier = auth('user')->user();
        $notification = Notification::with('supplyRequest')->findOrFail($notificationId);

        if (
            $notification->user_id !== $supplier->id ||
            $notification->purpose !== 'Supply Request'
        ) {
            return response()->json(['message' => 'Unauthorized or invalid notification'], 403);
        }

        $supplyRequest = $notification->supplyRequest;

        if (! $supplyRequest) {
            return response()->json(['message' => 'Supply request not found'], 404);
        }

        $supplyRequest->status = $request->response;

        if ($request->response === 'rejected') {
            $supplyRequest->rejection_reason = $request->rejection_reason;
        }

        $supplyRequest->save();

        Notification::create([
            'manager_id' => $supplyRequest->manager_id,
            'user_id' => $supplier->id,
            'supply_request_id' => $supplyRequest->id,
            'sent_by' => 'supplier',
            'purpose' => 'Response For Supply Request',
            'message' => "Supplier responded to your supply request #{$supplyRequest->id} with: {$request->response}\n".
                ($request->response === 'rejected' && $request->rejection_reason ? "Reason: {$request->rejection_reason}" : ''),
            'createdAt' => now(),
            'seen' => false,
        ]);

        return response()->json([
            'message' => 'Response submitted successfully.',
            'status' => $supplyRequest->status,
        ]);
    }

    //    ....................................................customer && employee notifications.......................................................................

    public function getAllCustomerNotifications(): JsonResponse
    {
        // التحقق من أن المستخدم موثق
        $user = auth('user')->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        // جلب الإشعارات حيث user_id يطابق id المستخدم الحالي
        // يمكنك أيضاً جلب الإشعارات التي ليس لها user_id (عامة للنظام) إذا كنت تريد ذلك
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('createdAt', 'desc') // ترتيب من الأحدث للأقدم
            ->get();

        // يمكنك تحويل البيانات إذا أردت تنسيقاً معيناً
        $formattedNotifications = $notifications->map(function ($notification) {
            return [
                'id' => $notification->id,
                'sent_by' => $notification->sent_by,
                'purpose' => $notification->purpose,
                'message' => $notification->message,
                'createdAt' => $notification->createdAt,
                'seen' => (bool) $notification->seen,
            ];
        });

        return response()->json([
            'message' => 'Notifications fetched successfully.',
            'notifications' => $formattedNotifications,
        ], 200);
    }

    //    ...........................................................................................................................
    public function markAsSeen($id): JsonResponse
    {
        $notification = Notification::findOrFail($id);

        $notification->seen = true;
        $notification->save();

        return response()->json(['message' => 'Notification marked as seen']);
    }
}


