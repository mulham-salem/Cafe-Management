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
        return $this->belongsTo(SupplyOffer::class, 'supplyOffer_id');
    }
    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class, 'inventoryItem_id');
    }
}
