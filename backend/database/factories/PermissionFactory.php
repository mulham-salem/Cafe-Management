<?php

namespace Database\Factories;

use App\Models\Permission;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PermissionFactory extends Factory
{
    protected $model = Permission::class;

    public function definition()
    {
        $users = User::all();

        return [
            'user_id' => $users->isNotEmpty() ? $users->random()->id : null,
            'permission' => $this->faker->randomElement([
                'User Management',
                'Menu Management',
                'Table Management',
                'Inventory Management',
                'Supply Management',
                'Promotion Management',
                'Report Dashboard',
                'Default',
            ]),
        ];
    }
}
