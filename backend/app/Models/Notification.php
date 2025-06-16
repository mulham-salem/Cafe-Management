<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(Manager::class, 'user_id');
    }

    public function supplyRequest()
    {
        return $this->belongsTo(SupplyRequest::class, 'supplyRequest_id');
    }

    protected $fillable = ['manager_id', 'supplyRequest_id', 'sent_by', 'purpose', 'user_id', 'message', 'seen', 'createdAt'];

    // إذا كنت لا تريد استخدام 'updated_at' و 'created_at' الافتراضيين لـ Laravel
    public $timestamps = false;

    // لتحديد اسم عمود التاريخ الذي تستخدمه
    protected $dates = ['createdAt'];

    // لضمان أن createdAt يتم تخزينه كتاريخ
    protected $casts = [
        'createdAt' => 'datetime',
    ];
}
