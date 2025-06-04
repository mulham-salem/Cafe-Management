<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Reservation;
use App\Models\Table;
use Illuminate\Database\Seeder;

class ReservationsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = Customer::all();
        $tables = Table::all();

        foreach ($customers as $customer) {
            Reservation::factory()->create([
                'customer_id' => $customer->id,
                'table_id' => $tables->random()->id,
            ]);
        }
    }
}
