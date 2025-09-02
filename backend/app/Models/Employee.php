<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Employee extends Model
{
    use HasFactory;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'employee_id');
    }

    public function complaint(): HasOne
    {
        return $this->hasOne(Complaint::class, 'employee_id');
    }

    public function orderControl(): HasMany
    {
        return $this->hasMany(OrderControl::class, 'employee_id');
    }

    public function tables(): HasMany
    {
        return $this->hasMany(Table::class, 'employee_id');
    }
}
