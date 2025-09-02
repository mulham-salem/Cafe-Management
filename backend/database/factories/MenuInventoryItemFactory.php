<?php

namespace Database\Factories;

use App\Models\InventoryItem;
use App\Models\MenuInventoryItem;
use App\Models\MenuItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class MenuInventoryItemFactory extends Factory
{
    protected $model = MenuInventoryItem::class;

    public function definition()
    {
        return [
            'menuItem_id' => MenuItem::inRandomOrder()->first()->id,
            'inventoryItem_id' => InventoryItem::inRandomOrder()->first()->id,
            'quantity_used' => $this->faker->numberBetween(1, 10),
            'unit' => $this->faker->randomElement(['kg', 'g', 'liter', 'ml', 'dozen', 'box', 'piece']),
        ];
    }
}
