<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @method static inRandomOrder()
 */
class MenuItem extends Model
{
    use HasFactory;

    public function manager(): BelongsTo
    {
        return $this->belongsTo(Manager::class, 'manager_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function menuInventoryItems(): HasMany
    {
        return $this->hasMany(MenuInventoryItem::class, 'menuItem_id');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'menuItem_id');
    }

    public function promotion(): BelongsTo
    {
        return $this->belongsTo(Promotion::class, 'promotion_id');
    }

    public function favoriteItem(): HasMany
    {
        return $this->hasMany(FavoriteItem::class, 'menu_item_id');
    }

    public function promotionMenuItems(): HasMany
    {
        return $this->hasMany(PromotionMenuItem::class, 'menu_item_id');
    }

    protected $fillable = ['name', 'description', 'price', 'category_id', 'manager_id', 'image_url', 'available'];
}
