<?php

namespace Database\Factories;

use App\Models\Table;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Table>
 */
class TableFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'number' => $this->faker->unique()->numberBetween(1, 100),
            'capacity' => $this->faker->numberBetween(2, 8),
            'status' => $this->faker->randomElement(['available', 'reserved', 'cleaning up']),
        ];
    }
}
