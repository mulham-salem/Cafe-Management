<?php

namespace App\Http\Controllers;

use App\Models\Notification;

class NotificationManagementController extends Controller
{
    public function getManagerNotifications()
    {
        $manager = auth('manager')->user();

        $notifications = Notification::where('manager_id', $manager->id)
            ->with('user')
            ->orderByDesc('createdAt')
            ->get();

        $formatted = $notifications->map(function ($notification) {
            return [
                'id' => $notification->id,
                'message' => $notification->message,
                'supplier_name' => $notification->user->name ?? 'Unknown',
                'supplier_id' => $notification->user->id ?? null,
                'seen' => $notification->seen,
                'created_at' => $notification->createdAt->diffForHumans(),
            ];
        });

        return response()->json([
            'notifications' => $formatted,
        ]);
    }
}
