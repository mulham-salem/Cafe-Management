<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @mixin IdeHelperPromotionMenuItem
 */
class PromotionMenuItem extends Model
{
    protected $table = 'promotion_menu_item';

    use HasFactory;

    public function menuItem(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class, 'menu_item_id');
    }

    public function promotion(): BelongsTo
    {
        return $this->belongsTo(Promotion::class, 'promotion_id');
    }

    protected $fillable = [
        'menu_item_id',
        'promotion_id',
        'quantity',
    ];
}
