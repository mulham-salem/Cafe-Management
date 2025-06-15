<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationManagementController extends Controller
{
    public function index()
    {
        auth('manager')->user();

        $notifications = Notification::where('manager_id', auth('manager')->id())
            ->where('sent_by', 'supplier')
            ->where('purpose', 'SupplyOffers')
            ->orderByDesc('createdAt')
            ->get();

        $formatted = $notifications->map(function ($notification) {
            return [

                'message' => $notification->message,
                'seen' => $notification->seen,

            ];
        });

        return response()->json([
            'notifications' => $formatted,
        ]);
    }
    //    ................................................................................................................................................

    public function index2()
    {
        $supplier = auth('user')->user();
        $notifications = Notification::where('user_id', $supplier->id)
            ->where('sent_by', 'manager')
            ->where('purpose', 'responseForOffers')
            ->whereIn('manager_id', [3, 4])
            ->orderByDesc('createdAt')
            ->get();

        $formatted = $notifications->map(function ($notification) {
            return [
                'message' => $notification->message,
                'seen' => $notification->seen,
            ];
        });

        return response()->json([
            'notifications' => $formatted,
        ]);
    }
    //    ................................................................................................................................................

    public function index3()
    {
        $supplier = auth('user')->user();

        $notifications = Notification::where('user_id', $supplier->id)
            ->where('sent_by', 'manager')
            ->where('purpose', 'supplyRequestFromManager')
            ->with(['supplyRequest.supplyRequestItems.inventoryItem', 'supplyRequest.manager'])
            ->orderByDesc('createdAt')
            ->get();

        $formatted = $notifications->map(function ($notification) {
            return [
                'message' => $notification->message,
                'seen' => $notification->seen,
                'status' => optional($notification->supplyRequest)->status,
                'note' => optional($notification->supplyRequest)->note,
                'items' => optional($notification->supplyRequest)->supplyRequestItems->map(function ($item) {
                    return [
                        'name' => $item->inventoryItem->name ?? 'Unknown Item',
                        'quantity' => $item->quantity,
                    ];
                }),
                'manager_name' => optional($notification->supplyRequest->manager)->user->name ?? 'Unknown Manager',
            ];
        });

        return response()->json([
            'notifications' => $formatted,
        ]);
    }
    //    ................................................................................................................................................

    public function index4(Request $request, $notificationId): JsonResponse
    {
        $request->validate([
            'response' => 'required|in:accepted,rejected',
            'rejection_reason' => 'nullable|string|max:500',
        ]);

        $supplier = auth('user')->user();
        $notification = Notification::with('supplyRequest')->findOrFail($notificationId);

        if (
            $notification->user_id !== $supplier->id ||
            $notification->purpose !== 'supplyRequestFromManager'
        ) {
            return response()->json(['message' => 'Unauthorized or invalid notification'], 403);
        }

        $supplyRequest = $notification->supplyRequest;

        if (! $supplyRequest) {
            return response()->json(['message' => 'Supply request not found'], 404);
        }

        $supplyRequest->status = $request->response;

        if ($request->response === 'rejected') {
            $supplyRequest->note = $request->note;
        }

        $supplyRequest->save();

        Notification::create([
            'manager_id' => $supplyRequest->manager_id,
            'user_id' => $supplier->id,
            'supply_request_id' => $supplyRequest->id,
            'sent_by' => 'supplier',
            'purpose' => 'supplierResponseToRequest',
            'message' => "Supplier responded to your supply request #{$supplyRequest->id} with: {$request->response}".
                        ($request->response === 'rejected' && $request->rejection_reason ? " - Reason: {$request->rejection_reason}" : ''),
            'createdAt' => now(),
            'seen' => false,
        ]);

        return response()->json([
            'message' => 'Response submitted successfully.',
            'status' => $supplyRequest->status,
        ]);
    }
    //    ................................................................................................................................................

    public function index5()
    {
        $manager = auth('manager')->user();

        $notifications = Notification::where('manager_id', $manager->id)
            ->where('sent_by', 'supplier')
            ->where('purpose', 'supplierResponseToRequest')
            ->with(['supplyRequest', 'user'])
            ->orderByDesc('createdAt')
            ->get();

        $formatted = $notifications->map(function ($notification) {
            return [
                'message' => $notification->message,
                'seen' => $notification->seen,
                'supplier_name' => $notification->user->name ?? 'Unknown Supplier',
            ];
        });

        return response()->json([
            'notifications' => $formatted,
        ]);
    }
}
