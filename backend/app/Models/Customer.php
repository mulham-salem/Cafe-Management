<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @method static inRandomOrder()
 */
class Customer extends Model
{
    use HasFactory;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'customer_id');
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class, 'customer_id');
    }

    public function complaint(): HasMany
    {
        return $this->hasMany(Complaint::class, 'customer_id');
    }

    public function favoriteItem(): HasMany
    {
        return $this->hasMany(FavoriteItem::class, 'customer_id');
    }

    public function loyalityAccount(): HasMany
    {
        return $this->hasMany(LoyalityAccount::class, 'customer_id');
    }

    protected $fillable = [
        'phone_number',
        'address',
    ];
}
