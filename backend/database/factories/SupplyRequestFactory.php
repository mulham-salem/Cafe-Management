<?php

namespace Database\Factories;

use App\Models\Manager;
use App\Models\SupplyRequest;
use Illuminate\Database\Eloquent\Factories\Factory;

class SupplyRequestFactory extends Factory
{
    protected $model = SupplyRequest::class;

    public function definition()
    {
        $managers = Manager::all();

        return [
            'manager_id' => $managers->isNotEmpty() ? $managers->random()->id : null,
            'title' => $this->faker->optional()->sentence(3),
            'request_date' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'note' => $this->faker->optional()->paragraph(),
            'status' => $this->faker->randomElement(['pending', 'accepted', 'rejected']),
            'reject_reason' => $this->faker->optional()->sentence(),
        ];
    }
}
