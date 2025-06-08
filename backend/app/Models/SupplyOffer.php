<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @method static inRandomOrder()
 */
class SupplyOffer extends Model
{
    use HasFactory;

    public function purchaseBill(): HasOne
    {
        return $this->hasOne(PurchaseBill::class, 'supplyOffer_id');
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    public function supplyOfferItems(): HasMany
    {
        return $this->hasMany(SupplyOfferItem::class, 'supplyOffer_id');
    }

    protected function casts(): array
    {
        return [
            'delivery_date' => 'datetime',
        ];
    }

    protected $fillable = ['supplier_id', 'title', 'total_price', 'delivery_date', 'note', 'status'];
}
