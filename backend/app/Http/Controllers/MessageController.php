<?php



namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\InternalMessage;
use App\Models\User;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * جلب قائمة الكونتاكتس مع عداد الرسائل الغير مقروءة
     */
    public function contacts()
    {
        $user = auth('manager')->check() ? auth('manager')->user() : auth()->user();

        if ($user->role === 'Manager') {
            // المدير يشوف كل المستخدمين
            $contacts = User::select('id', 'first_name', 'last_name', 'role')->get();
        } else {
            // المستخدمين العاديين يشوفوا باقي المستخدمين عدا نفسه
            $contacts = User::where('id', '!=', $user->id)
                ->select('id', 'first_name', 'last_name', 'role')
                ->get();
        }

        $contacts = $contacts->map(function ($contact) use ($user) {
            $unreadCount = InternalMessage::where('receiver_id', $user->id)
                ->where('sender_id', $contact->id)
                ->where('unread', true)
                ->count();

            return [
                'id' => $contact->id,
                'full_name' => $contact->first_name . ' ' . $contact->last_name,
                'role' => $contact->role,
                'unread' => $unreadCount,
            ];
        });

        return response()->json($contacts);
    }

    /**
     * جلب المحادثة مع مستخدم معين
     */
    public function thread($contactId)
    {
        $user = auth('manager')->check() ? auth('manager')->user() : auth()->user();

        $messages = InternalMessage::where(function ($q) use ($user, $contactId) {
                $q->where('sender_id', $user->id)
                  ->where('receiver_id', $contactId);
            })
            ->orWhere(function ($q) use ($user, $contactId) {
                $q->where('sender_id', $contactId)
                  ->where('receiver_id', $user->id);
            })
            ->orderBy('sent_at', 'asc')
            ->get();

        return response()->json($messages);
    }

    /**
     * إرسال رسالة جديدة
     */
    public function store(Request $request)
    {
        $user = auth('manager')->check() ? auth('manager')->user() : auth()->user();

        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'body' => 'required|string',
            'subject' => 'nullable|string',
        ]);

        $receiver = User::find($validated['receiver_id']);

        $message = InternalMessage::create([
            'sender_id' => $user->id,
            'receiver_id' => $receiver->id,
            'sender_name' => $user->first_name . ' ' . $user->last_name,
            'receiver_name' => $receiver->first_name . ' ' . $receiver->last_name,
            'body' => $validated['body'],
            'subject' => $validated['subject'] ?? null,
            'sent_at' => now(),
            'unread' => true,
        ]);

        // بث الرسالة عبر WebSocket لجميع المستخدمين ما عدا المرسل
        broadcast(new MessageSent($message))->toOthers();

        return response()->json($message, 201);
    }

    /**
     * تعليم الرسائل كمقروءة
     */
    public function markRead(Request $request)
    {
        $user = auth('manager')->check() ? auth('manager')->user() : auth()->user();

        $validated = $request->validate([
            'contact_id' => 'required|exists:users,id',
        ]);

        InternalMessage::where('receiver_id', $user->id)
            ->where('sender_id', $validated['contact_id'])
            ->where('unread', true)
            ->update([
                'unread' => false,
                'read_at' => now(),
            ]);

        return response()->json([
            'message' => "Messages from contact {$validated['contact_id']} marked as read."
        ]);
    }

    /**
     * جلب المستخدم الحالي
     */
    public function currentUser()
    {
        $user = auth('manager')->check() ? auth('manager')->user() : auth()->user();
        return response()->json($user);
    }
}



