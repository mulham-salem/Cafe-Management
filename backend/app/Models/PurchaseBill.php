<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @method static inRandomOrder()
 */
class PurchaseBill extends Model
{
    use HasFactory;

    public function supplyOffer(): belongsTo
    {
        return $this->belongsTo(SupplyOffer::class, 'supplyOffer_id');
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(Manager::class, 'manager_id');
    }

    public function inventoryItems(): HasMany
    {
        return $this->hasMany(InventoryItem::class, 'purchaseBill_id');
    }

    protected $fillable = ['unit_price', 'total_amount', 'purchase_date', 'manager_id', 'supplyOffer_id', 'supplier_id'];
}
