<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @method static inRandomOrder()
 */
class Promotion extends Model
{
    use HasFactory;

    public function manager(): BelongsTo
    {
        return $this->belongsTo(Manager::class, 'manager_id');
    }

    public function menuItems(): HasMany
    {
        return $this->hasMany(MenuItem::class, 'promotion_id');
    }

    public function promotionMenuItems(): HasMany
    {
        return $this->hasMany(PromotionMenuItem::class, 'promotion_id');
    }

    protected $fillable = ['title', 'discount_percentage', 'start_date', 'end_date', 'description',  'manager_id'];
}
