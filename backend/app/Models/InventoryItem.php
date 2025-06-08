<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @method static inRandomOrder()
 */
class InventoryItem extends Model
{
    use HasFactory;

    public function manager(): BelongsTo
    {
        return $this->belongsTo(Manager::class, 'manager_id');
    }

    public function purchaseBill(): BelongsTo
    {
        return $this->belongsTo(PurchaseBill::class, 'purchaseBill_id');
    }

    public function supplyRequestItems(): HasMany
    {
        return $this->hasMany(SupplyRequestItem::class, 'inventoryItem_id');
    }

    public function supplyOfferItems(): HasMany
    {
        return $this->hasMany(SupplyOfferItem::class, 'inventoryItem_id');
    }

    public function menuInventoryItems(): HasMany
    {
        return $this->hasMany(MenuInventoryItem::class, 'inventoryItem_id');
    }

    public function promotion(): BelongsTo
    {
        return $this->belongsTo(Promotion::class, 'promotion_id');
    }

    protected $fillable = ['name', 'quantity', 'unit', 'expiry_date', 'threshold_level', 'promotion_id', 'purchaceBill_id', 'manager_id'];
}
