<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\Table;
use Illuminate\Database\Eloquent\Factories\Factory;

class TableFactory extends Factory
{
    protected $model = Table::class;

    public function definition()
    {
        return [
            'number' => $this->faker->unique()->numberBetween(1, 50), // رقم الطاولة
            'capacity' => $this->faker->numberBetween(2, 12), // سعة الطاولة
            'status' => $this->faker->randomElement(['available', 'reserved', 'cleaning']),
            'employee_id' => Employee::inRandomOrder()->first()?->id, // يمكن يكون null
        ];
    }
}
