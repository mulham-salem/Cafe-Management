<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @method static inRandomOrder()
 */
class SupplyRequest extends Model
{
    use HasFactory;

    public function manager(): BelongsTo
    {
        return $this->belongsTo(Manager::class, 'manager_id');
    }

    public function supplyRequestItems(): HasMany
    {
        return $this->hasMany(SupplyRequestItem::class, 'supplyRequest_id');
    }

    public function supplyHistory(): HasOne
    {
        return $this->hasOne(SupplyHistory::class, 'supply_request_id');
    }

    protected $fillable = ['manager_id', 'title', 'note', 'request_date', 'status'];
}
