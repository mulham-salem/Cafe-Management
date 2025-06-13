<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @method static inRandomOrder()
 * @property int $quantity
 * @property $threshold_level
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
        return $this->belongsTo(PurchaseBill::class, 'purchase_bill_id');
    }

    public function supplyRequestItems(): HasMany
    {
        return $this->hasMany(SupplyRequestItem::class, 'inventory_item_id');
    }

    public function supplyOfferItems(): HasMany
    {
        return $this->hasMany(SupplyOfferItem::class, 'inventory_item_id');
    }

    public function menuInventoryItems(): HasMany
    {
        return $this->hasMany(MenuInventoryItem::class, 'inventory_item_id');
    }

    protected $fillable = ['name', 'quantity', 'unit', 'note', 'expiry_date', 'threshold_level', 'promotion_id', 'purchaseBill_id', 'manager_id'];
}
