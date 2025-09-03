<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @method static inRandomOrder()
 * @mixin IdeHelperOrder
 */
class Order extends Model
{
    use HasFactory;

    public function bill(): HasOne
    {
        return $this->hasOne(Bill::class, 'order_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    public function complaint(): HasOne
    {
        return $this->hasOne(Complaint::class, 'order_id');
    }

    public function deliveryOrder(): HasOne
    {
        return $this->hasOne(DeliveryOrder::class, 'order_id');
    }

    protected $fillable = [
        'customer_id',
        'employee_id',
        'createdAt',
        'confirmedAt',
        'status',
        'note',
        'onHold',
        'pickup_method',
        'pickup_time',
        'rating_score',
        'rating_comment',
        'used_loyalty_points',
        'repreparation_request',
        'repreparation_reason',
    ];
}
