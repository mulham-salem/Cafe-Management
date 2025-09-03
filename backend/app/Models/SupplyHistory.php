<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @mixin IdeHelperSupplyHistory
 */
class SupplyHistory extends Model
{
    protected $table = 'supply_history';

    use HasFactory;

    public function supplyOfferHistory(): BelongsTo
    {
        return $this->belongsTo(SupplyOffer::class, 'supply_offer_id');
    }

    public function supplyRequestHistory(): BelongsTo
    {
        return $this->belongsTo(SupplyRequest::class, 'supply_request_id');
    }

    protected $fillable = [
        'supply_request_id',
        'supply_offer_id',
        'status',
        'type',
        'supply_date',
        'item_name',
        'item_quantity',
        'reject_reason',
    ];
}
