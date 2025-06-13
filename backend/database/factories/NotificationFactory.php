<?php

namespace Database\Factories;

use App\Models\Notification;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Notification>
 */
class NotificationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'purpose' => $this->faker->randomElement(['supply_offer', 'reservation_request', 'inventory_alert']),
            'sent_by' => $this->faker->randomElement(['supplier', 'employee']),
            'message' => $this->faker->sentence(),
            'createdAt' => $this->faker->dateTime(),
            'seen' => $this->faker->boolean(),
        ];
    }
}
