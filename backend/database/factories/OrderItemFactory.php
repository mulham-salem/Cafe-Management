<?php

namespace Database\Factories;

use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    public function definition()
    {
        $orders = Order::all();
        $menuItems = MenuItem::all();

        return [
            'order_id' => $orders->isNotEmpty() ? $orders->random()->id : null,
            'menuItem_id' => $menuItems->isNotEmpty() ? $menuItems->random()->id : null,
            'quantity' => $this->faker->numberBetween(1, 5),
            'item_name' => $this->faker->word,
            'price' => $this->faker->randomFloat(2, 1, 100),
        ];
    }
}
