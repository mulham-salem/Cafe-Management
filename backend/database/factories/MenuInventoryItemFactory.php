<?php

namespace Database\Factories;

use App\Models\MenuInventoryItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MenuInventoryItem>
 */
class MenuInventoryItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'quantity_used' => $this->faker->randomFloat(2, 0.1, 5),
            'unit' => $this->faker->randomElement(['kg', 'ml', 'pcs']),
        ];
    }
}
