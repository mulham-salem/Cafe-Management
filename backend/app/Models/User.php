<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * @method static whereDoesntHave(string $string)
 * @method static where(string $string, mixed $username)
 * @method static whereIn(string $string, string[] $array)
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory,Notifiable;

    public function employee(): HasOne
    {
        return $this->hasOne(Employee::class, 'id', 'id');
    }

    public function customer(): HasOne
    {
        return $this->hasOne(Customer::class, 'id', 'id');
    }

    public function supplier(): HasOne
    {
        return $this->hasOne(Supplier::class, 'id', 'id');
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(Manager::class, 'manager_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'user_id');
    }

    public function permissions(): HasMany
    {
        return $this->hasMany(Permission::class, 'user_id');
    }

    protected static function booted(): void
    {
        static::created(function ($user) {
            if (in_array($user->role, ['employee', 'supplier'])) {
                if ($user->permissions()->count() === 0) {
                    Permission::create([
                        'user_id' => $user->id,
                        'permission' => 'Default',
                    ]);
                }
            }
        });
    }

    protected $fillable = ['name', 'username', 'email', 'password', 'role', 'manager_id'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return ['password' => 'hashed'];
    }
}
