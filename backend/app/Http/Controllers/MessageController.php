<?php

namespace App\Http\Controllers;

use App\Models\InternalMessage;
use App\Models\User;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    // جلب جهات الاتصال
    public function contacts()
    {
        $user = auth('user')->user();

        $contacts = User::where('id', '!=', $user->id)
            ->get()
            ->map(function ($contact) use ($user) {
                $unread = InternalMessage::where('sender_id', $contact->id)
                    ->where('receiver_id', $user->id)
                    ->whereNull('read_at')
                    ->count();

                return [
                    'id' => $contact->id,
                    'first_name' => $contact->first_name,
                    'role' => $contact->role,
                    'unread' => $unread,
                ];
            });

        return response()->json($contacts);
    }

    // جلب محادثة
    public function thread($contactName)
    {
        $user = auth('user')->user();
        $contact = User::where('first_name', $contactName)->firstOrFail();

        $messages = InternalMessage::where(function ($q) use ($user, $contact) {
                $q->where('sender_id', $user->id)->where('receiver_id', $contact->id);
            })
            ->orWhere(function ($q) use ($user, $contact) {
                $q->where('sender_id', $contact->id)->where('receiver_id', $user->id);
            })
            ->orderBy('sent_at')
            ->get();

        return response()->json($messages);
    }

    // إرسال رسالة
    public function store(Request $request)
    {
        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'body' => 'required|string',
            'subject' => 'nullable|string',
        ]);

        $message = InternalMessage::create([
            'sender_id' => auth('user')->id(),
            'receiver_id' => $validated['receiver_id'],
            'subject' => $validated['subject'] ?? null,
            'body' => $validated['body'],
            'sent_at' => now(),
        ]);

        // Event إذا بدك WebSocket
        // broadcast(new NewMessageEvent($message))->toOthers();

        return response()->json($message);
    }

    // تحديد كمقروء
    public function markRead(Request $request)
    {
        $validated = $request->validate([
            'contact_id' => 'required|exists:users,id',
        ]);

        InternalMessage::where('sender_id', $validated['contact_id'])
            ->where('receiver_id', auth('user')->id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'marked as read']);
    }
}

