<?php

namespace Database\Seeders;

use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Seeder;

class OrderItemsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $orders = Order::all();
        $menuItems = MenuItem::all();

        foreach ($orders as $order) {
            OrderItem::factory(4)->create([
                'order_id' => $order->id,
                'menuItem_id' => $menuItems->random()->id,
            ]);
        }
    }
}
