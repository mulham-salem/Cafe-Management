<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\FavoriteItem;
use App\Models\MenuItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\FavoriteItem>
 */
class FavoriteItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = FavoriteItem::class;

    public function definition()
    {
        return [
            'customer_id' => Customer::inRandomOrder()->first()->id,
            'menu_item_id' => MenuItem::inRandomOrder()->first()->id,
            'added_at' => $this->faker->dateTimeThisYear(),
        ];
    }
}
