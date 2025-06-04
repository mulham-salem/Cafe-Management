<?php

namespace Database\Factories;

use App\Models\Permission;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Permission>
 */
class PermissionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'permission' => $this->faker->randomElement([
                'User Management',
                'Menu Management',
                'Table Management',
                'Inventory & Supply',
                'Promotion Management',
                "Manager's Notifications",
                'Default'
            ]),
        ];
    }
}
