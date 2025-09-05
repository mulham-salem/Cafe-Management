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
 *
 * @property $role
 * @property $id
 * @property \Illuminate\Database\Eloquent\Collection|\App\Models\Permission[] $permissions
 *
 * @mixin IdeHelperUser
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

    public function deliveryWorker(): HasOne
    {
        return $this->hasOne(DeliveryWorker::class, 'id', 'id');
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

    public function userSender(): HasMany
    {
        return $this->hasMany(InternalMessage::class, 'sender_id');
    }

    public function userReceiver(): HasMany
    {
        return $this->hasMany(InternalMessage::class, 'receiver_id');
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

    protected $fillable = [
        'manager_id',
        'name',
        'username',
        'email',
        'password',
        'role',
        'first_name',
        'last_name',
        'image_url',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return ['password' => 'hashed'];
    }
}
