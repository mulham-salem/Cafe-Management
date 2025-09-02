<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalesReport extends Model
{
    use HasFactory;

    protected $table = 'sales_report';

    protected $casts = [
        'data' => 'array',
    ];

    public function manager(): BelongsTo
    {
        return $this->belongsTo(Manager::class, 'manager_id');
    }

    protected $fillable = [
        'manager_id',
        'start_date',
        'end_date',
        'top_items',
        'total_sales',
        'total_orders',
        'generated_at',
    ];
}
