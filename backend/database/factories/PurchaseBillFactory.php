<?php

namespace Database\Factories;

use App\Models\PurchaseBill;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PurchaseBill>
 */
class PurchaseBillFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'unit_price' => $this->faker->randomFloat(2, 5, 100),
            'total_amount' => $this->faker->randomFloat(2, 200, 5000),
            'purchase_date' => $this->faker->dateTimeBetween('-1 month', 'now'),
        ];
    }
}
