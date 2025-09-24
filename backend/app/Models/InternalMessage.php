<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InternalMessage extends Model
{
    protected $table = 'internal_message';

    use HasFactory;

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'subject',
        'body',
        'sender_name',
        'receiver_name',
        'sent_at',
        'read_at',
        'unread',
    ];
}
