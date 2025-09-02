<?php

namespace Database\Factories;

use App\Models\Supplier;
use App\Models\SupplyOffer;
use Illuminate\Database\Eloquent\Factories\Factory;

class SupplyOfferFactory extends Factory
{
    protected $model = SupplyOffer::class;

    public function definition()
    {
        $suppliers = Supplier::all();

        return [
            'supplier_id' => $suppliers->isNotEmpty() ? $suppliers->random()->id : null,
            'title' => $this->faker->sentence(3),
            'total_price' => $this->faker->randomFloat(2, 50, 1000),
            'delivery_date' => $this->faker->dateTimeBetween('now', '+1 month'),
            'note' => $this->faker->optional()->sentence(5),
            'status' => $this->faker->randomElement(['pending', 'accepted', 'rejected']),
            'reject_reason' => $this->faker->optional()->sentence(3),
        ];
    }
}
