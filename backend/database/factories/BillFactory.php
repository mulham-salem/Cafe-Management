<?php

namespace Database\Factories;

use App\Models\Bill;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Bill>
 */
class BillFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'total_amount' => $this->faker->randomFloat(2, 50, 1000),
            'payment_method' => $this->faker->randomElement(['cash', 'credit card', 'QR Code']),
            'date_issued' => $this->faker->dateTimeBetween('now', '+1 day'),
        ];
    }
}

