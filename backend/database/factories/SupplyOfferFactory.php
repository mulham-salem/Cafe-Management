<?php

namespace Database\Factories;

use App\Models\SupplyOffer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SupplyOffer>
 */
class SupplyOfferFactory extends Factory
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
            'total_price' => $this->faker->randomFloat(2, 100, 1000),
            'delivery_date' => $this->faker->dateTimeBetween('now', '+1 month'),
            'note' => $this->faker->optional()->text(),
            'status' => $this->faker->randomElement(['pending', 'accepted', 'rejected']),
        ];
    }
}

