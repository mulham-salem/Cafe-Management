<?php

namespace Database\Seeders;

use App\Models\Bill;
use App\Models\Order;
use Illuminate\Database\Seeder;

class BillsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $orders = Order::all();

        foreach ($orders as $order) {
            Bill::factory()->create(['order_id' => $order->id]);
        }
    }
}
