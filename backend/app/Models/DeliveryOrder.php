<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @mixin IdeHelperDeliveryOrder
 */
class DeliveryOrder extends Model
{
    protected $table = 'delivery_order';

    use HasFactory;

    public function liveLocation(): HasMany
    {
        return $this->hasMany(LiveLocation::class, 'delivery_order_id');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function deliveryWorker(): BelongsTo
    {
        return $this->belongsTo(DeliveryWorker::class, 'delivery_worker_id');
    }

    protected $fillable = [
        'phone_number',
        'address',
    ];
}
