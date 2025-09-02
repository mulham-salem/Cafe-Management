<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Reservation extends Model
{
    use HasFactory;

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function table(): BelongsTo
    {
        return $this->belongsTo(Table::class, 'table_id');
    }

    public function complaint(): HasOne
    {
        return $this->hasOne(Complaint::class, 'reservation_id');
    }

    protected $fillable = [
        'customer_id',
        'table_id',
        'reservation_time',
        'numberOfGuests',
        'status',
    ];
}
