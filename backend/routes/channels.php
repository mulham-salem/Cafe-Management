<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('messages.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId || auth('manager')->check();
});

