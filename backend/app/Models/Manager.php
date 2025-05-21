<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @method static inRandomOrder()
 */
class Manager extends Model
{
    use HasFactory;
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'manager_id');
    }
    public function tables(): HasMany
    {
        return $this->hasMany(Table::class, 'manager_id');
    }
    public function menuItems(): HasMany
    {
        return $this->hasMany(MenuItem::class, 'manager_id');
    }
    public function promotions(): HasMany
    {
        return $this->hasMany(Promotion::class, 'manager_id');
    }
    public function inventoryItems(): HasMany
    {
        return $this->hasMany(InventoryItem::class, 'manager_id');
    }
    public function supplyRequests(): HasMany
    {
        return $this->hasMany(SupplyRequest::class, 'manager_id');
    }
    public function purchaseBills(): HasMany
    {
        return $this->hasMany(PurchaseBill::class, 'manager_id');
    }

}
