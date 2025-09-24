<?php

namespace App\Events;

use App\Models\InternalMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    public function __construct(InternalMessage $message)
    {
        $this->message = $message;
    }

    // اسم القناة
    public function broadcastOn(): Channel
    {
        return new Channel('messages.'.$this->message->receiver_id);
    }

    public function broadcastAs(): string
    {
        return 'message.sent';
    }
}
