<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Employee;
use App\Models\Order;
use Illuminate\Database\Seeder;

class OrdersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = Customer::all();
        $employees = Employee::all();

        foreach (range(1, 4) as $ignored) {
            $createdByCustomer = rand(0, 1);

            Order::factory()->create([
                'customer_id' => $createdByCustomer ? $customers->random()->id : null,
                'employee_id' => !$createdByCustomer ? $employees->random()->id : null,
            ]);
        }
    }
}
