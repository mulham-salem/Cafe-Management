<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

/**
 * @method static where(string $string, mixed $username)
 */
class Manager extends Authenticatable
{
    use HasFactory,HasApiTokens;
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

    protected $fillable = ['name', 'username', 'email', 'password','remember_token'];

    protected $hidden = ['password', 'remember_token'];
}
