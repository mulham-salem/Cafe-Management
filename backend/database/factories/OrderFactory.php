<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Employee;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition()
    {
        $customers = Customer::all();
        $employees = Employee::all();

        return [
            'customer_id' => $customers->isNotEmpty() ? $customers->random()->id : null,
            'employee_id' => $employees->isNotEmpty() ? $employees->random()->id : null,
            'createdAt' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'confirmedAt' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'status' => $this->faker->randomElement(['pending', 'confirmed', 'preparing', 'ready', 'delivered']),
            'note' => $this->faker->optional()->sentence(6),
            'onHold' => $this->faker->boolean(20),
            'pickup_method' => $this->faker->randomElement(['dineIn', 'takeaway', 'delivery']),
            'pickup_time' => $this->faker->optional()->dateTimeBetween('now', '+1 week'),
            'rating_score' => $this->faker->optional()->randomFloat(1, 1, 5),
            'rating_comment' => $this->faker->optional()->sentence(),
            'used_loyalty_points' => $this->faker->optional()->randomFloat(2, 0, 50),
            'repreparation_request' => $this->faker->boolean(10),
            'repreparation_reason' => $this->faker->optional()->sentence(),
        ];
    }
}
