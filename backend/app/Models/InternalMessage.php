<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InternalMessage extends Model
{
    protected $table = 'internal_message';

    use HasFactory;

    public function userSender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function userReceiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'subject',
        'body',
        'sender_name',
        'receiver_name',
        'sent_at',
        'read_at',
    ];
}
