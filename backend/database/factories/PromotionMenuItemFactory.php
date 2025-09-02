<?php

namespace Database\Factories;

use App\Models\MenuItem;
use App\Models\Promotion;
use App\Models\PromotionMenuItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class PromotionMenuItemFactory extends Factory
{
    protected $model = PromotionMenuItem::class;

    public function definition()
    {
        $promotions = Promotion::all();
        $menuItems = MenuItem::all();

        return [
            'promotion_id' => $promotions->isNotEmpty() ? $promotions->random()->id : null,
            'menu_item_id' => $menuItems->isNotEmpty() ? $menuItems->random()->id : null,
            'quantity' => $this->faker->numberBetween(1, 10),
        ];
    }
}
