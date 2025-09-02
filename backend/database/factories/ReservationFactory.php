<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Reservation;
use App\Models\Table;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReservationFactory extends Factory
{
    protected $model = Reservation::class;

    public function definition()
    {
        $customers = Customer::all();
        $tables = Table::all();

        return [
            'customer_id' => $customers->isNotEmpty() ? $customers->random()->id : null,
            'table_id' => $tables->isNotEmpty() ? $tables->random()->id : null,
            'reservation_time' => $this->faker->dateTimeBetween('now', '+1 month'),
            'numberOfGuests' => $this->faker->numberBetween(1, 10),
            'status' => $this->faker->randomElement(['Active', 'Inactive']),
        ];
    }
}
