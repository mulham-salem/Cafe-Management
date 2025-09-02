<?php

namespace Database\Factories;

use App\Models\DeliveryWorker;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DeliveryWorker>
 */
class DeliveryWorkerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = DeliveryWorker::class;

    public function definition()
    {
        return [
            'user_id' => User::where('role', 'deliveryWorker')->inRandomOrder()->first()->id,
            'transport' => $this->faker->randomElement(['Bike', 'Motorbike', 'Car', 'Van']),
            'license' => strtoupper($this->faker->bothify('??###??')),
            'status' => $this->faker->randomElement(['Available', 'OnDelivery', 'Inactive']),
            'rating' => $this->faker->optional()->randomFloat(1, 3.0, 5.0),
        ];
    }
}
