<?php

// app/Events/MessageSent.php

namespace App\Events;

use App\Models\InternalMessage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $message;

    public function __construct(InternalMessage $message)
    {
        $this->message = $message;
    }

    public function broadcastOn()
    {
        // قناة خاصة بين المرسل والمستقبل
        return new PrivateChannel("chat.{$this->message->receiver_id}");
    }
}
