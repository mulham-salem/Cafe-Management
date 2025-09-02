<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinanicalReport extends Model
{
    protected $table = 'finanical_report';

    protected $casts = [
        'data' => 'array',
    ];

    use HasFactory;

    public function manager(): BelongsTo
    {
        return $this->belongsTo(Manager::class, 'manager_id');
    }

    protected $fillable = [
        'manager_id',
        'start_date',
        'end_date',
        'net_profit',
        'total_expenses',
        'total_revenue',
        'generated_at',
    ];
}
