<?php

namespace Database\Factories;

use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'customer_id' => null,
            'employee_id' => null,
            'createdAt' => $this->faker->dateTimeBetween('-1 week', 'now'),
            'confirmedAt' => $this->faker->dateTimeBetween('now', '+1 day'),
            'status' => $this->faker->randomElement(['In Preparation', 'Ready', 'Delivered']),
            'note' => $this->faker->optional()->text(),
        ];
    }
}
