<?php

namespace Database\Factories;

use App\Models\Manager;
use App\Models\Promotion;
use Illuminate\Database\Eloquent\Factories\Factory;

class PromotionFactory extends Factory
{
    protected $model = Promotion::class;

    public function definition()
    {
        $managers = Manager::all();

        return [
            'manager_id' => $managers->isNotEmpty() ? $managers->random()->id : null,
            'title' => $this->faker->sentence(3),
            'discount_percentage' => $this->faker->randomFloat(2, 5, 50), // بين 5% و 50%
            'start_date' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'end_date' => $this->faker->dateTimeBetween('now', '+1 month'),
            'description' => $this->faker->paragraph(),
        ];
    }
}
