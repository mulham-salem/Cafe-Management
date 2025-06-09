<?php

namespace Database\Factories;

use App\Models\InventoryItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InventoryItem>
 */
class InventoryItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'purchaseBill_id' => null,
            'name' => $this->faker->word(),
            'quantity' => $this->faker->numberBetween(10, 200),
            'unit' => $this->faker->randomElement(['kg', 'liters', 'pcs']),
            'threshold_level' => $this->faker->numberBetween(5, 20),
            'expiry_date' => $this->faker->dateTimeBetween('now', '+6 months'),
        ];
    }
}
