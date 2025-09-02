<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Employee;
use App\Models\Order;
use App\Models\Reservation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Complaint>
 */
class ComplaintFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $customer = Customer::inRandomOrder()->first();

        return [
            'customer_id' => $customer->id,
            'order_id' => rand(0, 1) ? Order::inRandomOrder()->first()?->id : null,
            'reservation_id' => rand(0, 1) ? Reservation::inRandomOrder()->first()?->id : null,
            'employee_id' => rand(0, 1) ? Employee::inRandomOrder()->first()?->id : null,
            'status' => $this->faker->randomElement(['New', 'In Progress', 'Resolved', 'Closed', 'Rejected']),
            'notes' => rand(0, 1) ? $this->faker->sentence(5) : null,
            'description' => $this->faker->paragraph(2),
        ];
    }
}
