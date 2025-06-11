<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplyOfferItem extends Model
{
    use HasFactory;

    public function supplyOffer(): BelongsTo
    {
        return $this->belongsTo(SupplyOffer::class, 'supply_offer_id');
    }

    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }

    protected $fillable = [
        'supply_offer_id',
        'name',
        'quantity',
        'unit',
        'unit_price',
        'total_price',
        'inventory_item_id',
    ];
}
