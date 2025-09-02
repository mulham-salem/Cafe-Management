<?php

namespace Database\Factories;

use App\Models\DeliveryOrder;
use App\Models\LiveLocation;
use Illuminate\Database\Eloquent\Factories\Factory;

class LiveLocationFactory extends Factory
{
    protected $model = LiveLocation::class;

    public function definition()
    {
        $deliveryOrder = DeliveryOrder::inRandomOrder()->first();

        return [
            'delivery_order_id' => $deliveryOrder->id,
            'latitude' => $this->faker->latitude(),
            'longitude' => $this->faker->longitude(),
            'description' => $this->faker->optional()->sentence(),
            'timestamp' => $this->faker->dateTimeThisMonth(),
        ];
    }
}
