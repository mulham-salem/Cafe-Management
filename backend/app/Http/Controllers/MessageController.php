<?php



namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\InternalMessage;
use App\Models\Manager;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MessageController extends Controller
{
    /**
     * جلب قائمة الكونتاكتس مع عداد الرسائل الغير مقروءة
     */
    public function contacts()
    {
        $user = auth('manager')->check() ? auth('manager')->user() : auth()->user();
        $checkIfManager = $user->role === 'Manager';

        $userQuery = User::select('id', 'full_name', 'role');
        // 1️⃣ جلب المستخدمين من جدول users
        if ($checkIfManager) {
            $userQuery->where('role', '!=', 'customer');// كل المستخدمين غير customer
        } else {
            $userQuery->where('role', '!=', 'customer')
                      ->where('id', '!=', $user->id);
        }
        $users = $userQuery->get();
        // 2️⃣ جلب المديرين من جدول managers
        $managersQuery = Manager::select('id', 'name', 'role');
        if ($checkIfManager) {
            $managersQuery->where('id', '!=', $user->id);
        }
        $managers = $managersQuery->get();

        // 3️⃣ دمج المستخدمين والمديرين في مصفوفة واحدة
        $contacts = collect();

        foreach ($users as $u) {
            $unreadCount = InternalMessage::where('receiver_id', $user->id)
                ->where('sender_id', $u->id)
                ->where('unread', true)
                ->count();

            $lastMessage = InternalMessage::where(function($q) use ($user, $u) {
                $q->where('sender_id', $user->id)
                    ->where('receiver_id', $u->id);
            })->orWhere(function($q) use ($user, $u) {
                $q->where('sender_id', $u->id)
                    ->where('receiver_id', $user->id);
            })
                ->latest('sent_at')
                ->first();


            $contacts->push([
                'id' => $u->id,
                'name' => $u->full_name,
                'role' => $u->role,
                'unread' => $unreadCount,
                'last_message' => $lastMessage ? $lastMessage->body : null,
            ]);
        }

        foreach ($managers as $m) {
            $unreadCount = InternalMessage::where('receiver_id', $user->id)
                ->where('sender_id', $m->id)
                ->where('unread', true)
                ->count();

            $lastMessage = InternalMessage::where(function($q) use ($user, $m) {
                $q->where('sender_id', $user->id)
                    ->where('receiver_id', $m->id);
            })->orWhere(function($q) use ($user, $m) {
                $q->where('sender_id', $m->id)
                    ->where('receiver_id', $user->id);
            })
                ->latest('sent_at')
                ->first();

            $contacts->push([
                'id' => $m->id,
                'name' => $m->name,
                'role' => 'manager',
                'unread' => $unreadCount,
                'last_message' => $lastMessage ? $lastMessage->body : null,
            ]);
        }

        return response()->json($contacts->values());
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

        // Validate inputs
        $validated = $request->validate([
            'receiver_id' => ['required', 'integer'],
            'sender_id'   => ['required', 'integer'],
            'body'        => ['required', 'string'],
            'subject'     => ['nullable', 'string'],
        ]);

        // Check if receiver exists in users or managers
        $receiver = User::find($validated['receiver_id']);
        if (! $receiver) {
            $receiver = Manager::find($validated['receiver_id']);
        }
        if (! $receiver) {
            throw ValidationException::withMessages([
                'receiver_id' => 'The selected receiver_id is invalid.',
            ]);
        }

        // Check if sender exists in users or managers
        $sender = User::find($validated['sender_id']);
        if (! $sender) {
            $sender = Manager::find($validated['sender_id']);
        }
        if (! $sender) {
            throw ValidationException::withMessages([
                'sender_id' => 'The selected sender_id is invalid.',
            ]);
        }

        // Build names depending on table
        $senderName   = $sender instanceof User ? $sender->full_name : $sender->name;
        $receiverName = $receiver instanceof User ? $receiver->full_name : $receiver->name;

        // Create the message
        $message = InternalMessage::create([
            'sender_id'     => $sender->id,
            'receiver_id'   => $receiver->id,
            'sender_name'   => $senderName,
            'receiver_name' => $receiverName,
            'body'          => $validated['body'],
            'subject'       => $validated['subject'] ?? null,
            'sent_at'       => now(),
            'unread'        => true,
        ]);

        // Broadcast event
        broadcast(new MessageSent($message));

        return response()->json($message, 201);
    }


    /**
     * تعليم الرسائل كمقروءة
     */
    public function markRead(Request $request)
    {
        $user = auth('manager')->check() ? auth('manager')->user() : auth()->user();

        $validated = $request->validate([
            'contact_id' => 'required',
            function ($attribute, $value, $fail) {
                $existsInUsers = DB::table('users')->where('id', $value)->exists();
                $existsInManagers = DB::table('managers')->where('id', $value)->exists();

                if (! $existsInUsers && ! $existsInManagers) {
                    $fail("The selected $attribute is invalid.");
                }
            },
        ]);

        InternalMessage::where('receiver_id', $user->id)
            ->where('sender_id', $validated['contact_id'])
            ->where('unread', true)
            ->update([
                'unread' => false,
                'read_at' => now(),
            ]);

        return response()->json([
            'message' => "Messages from contact {$validated['contact_id']} marked as read.",
        ]);
    }

    /**
     * جلب المستخدم الحالي
     */
    public function currentUser()
    {
        $user = auth('manager')->check() ? auth('manager')->user() : auth()->user();
        $is_manager = auth('manager')->check();

        return response()->json([
            'id' => $user->id,
            'name' => $is_manager ? $user->name : $user->first_name.' '.$user->last_name,
            'role' => $user->role,
        ]);
    }
}



