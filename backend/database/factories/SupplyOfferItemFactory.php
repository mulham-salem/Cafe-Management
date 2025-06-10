<?php

namespace Database\Factories;

use App\Models\SupplyOfferItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SupplyOfferItem>
 */
class SupplyOfferItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $unit = $this->faker->randomElement(['Bound', 'Gram', 'Kilo']);
        $quantity = $this->faker->numberBetween(1, 50);
        $unitPrice = $this->faker->randomFloat(2, 5, 100);

        return [

            'quantity' => $quantity,
            'unit' => $unit,
            'unit_price' => $unitPrice,
            'total_price' => $quantity * $unitPrice,
        ];
    }
}
