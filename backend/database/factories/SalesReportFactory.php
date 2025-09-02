<?php

namespace Database\Factories;

use App\Models\Manager;
use App\Models\SalesReport;
use Illuminate\Database\Eloquent\Factories\Factory;

class SalesReportFactory extends Factory
{
    protected $model = SalesReport::class;

    public function definition()
    {
        $managers = Manager::all();

        return [
            'type' => $this->faker->randomElement(['daily', 'weekly', 'monthly']),
            'start_date' => $this->faker->date(),
            'end_date' => $this->faker->date(),
            'data' => [
                'total_orders' => $this->faker->numberBetween(10, 100),
                'top_items' => [
                    ['name' => 'Burger', 'sales' => $this->faker->randomFloat(2, 100, 1000)],
                    ['name' => 'Pizza', 'sales' => $this->faker->randomFloat(2, 100, 1000)],
                ],
                'top_sales' => [
                    ['date' => $this->faker->date(), 'sales' => $this->faker->randomFloat(2, 200, 2000)],
                    ['date' => $this->faker->date(), 'sales' => $this->faker->randomFloat(2, 200, 2000)],
                ],
            ],
        ];

    }
}
