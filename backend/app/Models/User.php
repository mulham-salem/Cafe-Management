<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * @method static whereDoesntHave(string $string)
 * @method static where(string $string, mixed $username)
 */
class User extends Authenticatable
{
    use HasFactory, Notifiable;

    public function employee(): HasOne
    {
        return $this->hasOne(Employee::class, 'id');
    }
    public function customer(): HasOne
    {
        return $this->hasOne(Customer::class, 'id');
    }
    public function supplier(): HasOne
    {
        return $this->hasOne(Supplier::class, 'id');
    }
    public function manager(): BelongsTo
    {
        return $this->belongsTo(Manager::class, 'manager_id');
    }
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'user_id');
    }

    protected $fillable = ['name', 'username', 'email', 'password', 'role'];

    protected $hidden = ['password', 'remember_token',];

    protected function casts(): array
    {
        return ['password' => 'hashed',];
    }
}
