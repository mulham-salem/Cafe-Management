<?php

namespace Database\Factories;

use App\Models\Bill;
use App\Models\Order;
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
            'order_id' => Order::factory(),
            'total_amount' => $this->faker->randomFloat(2, 10, 500),
            'payment_method' => $this->faker->randomElement(['Cash', 'Card', 'Online']),
            'date_issued' => $this->faker->dateTimeThisYear(),
            'used_loyalty_points' => $this->faker->randomFloat(2, 0, 100),
        ];
    }
}
