<?php

namespace Database\Factories;

use App\Models\SupplyHistory;
use App\Models\SupplyOffer;
use App\Models\SupplyRequest;
use Illuminate\Database\Eloquent\Factories\Factory;

class SupplyHistoryFactory extends Factory
{
    protected $model = SupplyHistory::class;

    public function definition()
    {
        $offers = SupplyOffer::all();
        $requests = SupplyRequest::all();

        return [
            'supply_offer_id' => $offers->isNotEmpty() ? $offers->random()->id : null,
            'supply_request_id' => $requests->isNotEmpty() ? $requests->random()->id : null,
            'status' => $this->faker->randomElement(['pending', 'accepted', 'rejected']),
            'type' => $this->faker->randomElement(['supply request', 'supply offer']),
            'supply_date' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'item_name' => $this->faker->word(),
            'item_quantity' => $this->faker->numberBetween(1, 100),
            'reject_reason' => $this->faker->optional()->sentence(3),
        ];
    }
}
