<?php

namespace App\Http\Controllers;

use App\Models\Notification;

class NotificationManagementController extends Controller
{
    public function index()
    {
        $managerId = auth('manager')->id();
        $notification = Notification::where('manager_id', $managerId)->get();

        return response()->json([

            'Notification' => $notification,
        ]);

    }
}
