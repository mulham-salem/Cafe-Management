<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MenuInventoryItem extends Model
{
    use HasFactory;

    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }

    public function menuItem(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class, 'menuItem_id');
    }

    protected $fillable = [
        'menuItem_id',
        'inventoryItem_id',
        'quantity_used',
        'unit',
    ];
}
