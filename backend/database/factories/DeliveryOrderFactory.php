<?php

namespace Database\Factories;

use App\Models\DeliveryWorker;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DeliveryOrder>
 */
class DeliveryOrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $deliveryWorker = DeliveryWorker::inRandomOrder()->first();

        return [
            'delivery_worker_id' => $deliveryWorker->user_id,
            'order_id' => rand(0, 1) ? Order::inRandomOrder()->first()?->id : null,
            'status' => $this->faker->randomElement(['Pending', 'Assigned', 'InTransit', 'Delivered']),
            'cost' => $this->faker->randomFloat(2, 5, 50),
            'address' => $this->faker->address(),
            'pickup_time' => $this->faker->dateTimeBetween('-1 week', '+1 week'),
            'estimated_time' => $this->faker->dateTimeBetween('+1 hour', '+3 hours'),
            'rating_score' => rand(0, 1) ? $this->faker->randomFloat(1, 1, 5) : null,
            'rating_comment' => rand(0, 1) ? $this->faker->sentence(6) : null,
        ];
    }
}
