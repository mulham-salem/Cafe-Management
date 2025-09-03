<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @mixin IdeHelperLoyalityAccount
 */
class LoyalityAccount extends Model
{
    protected $table = 'loyality_account';

    use HasFactory;

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    protected $fillable = [
        'customer_id',
        'points_balance',
        'tier',
        'last_update',
    ];
}
