<?php

namespace Database\Factories;

use App\Models\SupplyRequest;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SupplyRequest>
 */
class SupplyRequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(3),
            'request_date' => $this->faker->dateTimeBetween('-1 week', 'now'),
            'note' => $this->faker->optional()->text(),
            'status' => $this->faker->randomElement(['pending', 'approved', 'rejected']),
        ];
    }
}

