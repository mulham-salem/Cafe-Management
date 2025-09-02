<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\OrderControl;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderControlFactory extends Factory
{
    protected $model = OrderControl::class;

    public function definition()
    {
        $employees = Employee::all();

        return [
            'employee_id' => $employees->isNotEmpty() ? $employees->random()->id : null,
            'status' => $this->faker->randomElement(['open', 'closed']),
            'timestamp' => $this->faker->dateTimeBetween('-1 month', 'now'),
        ];
    }
}
