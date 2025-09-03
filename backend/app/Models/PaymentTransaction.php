<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @mixin IdeHelperPaymentTransaction
 */
class PaymentTransaction extends Model
{
    protected $table = 'payment_transaction';

    use HasFactory;

    public function bill(): BelongsTo
    {
        return $this->belongsTo(Bill::class, 'bill_id');
    }

    protected $fillable = [
        'bill_id',
        'method',
        'status',
        'transaction_code',
        'processed_at',
    ];
}
