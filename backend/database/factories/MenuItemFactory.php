<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Manager;
use App\Models\MenuItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class MenuItemFactory extends Factory
{
    protected $model = MenuItem::class;

    public function definition()
    {
        return [
            'category_id' => Category::inRandomOrder()->first()->id,
            'manager_id' => Manager::inRandomOrder()->first()->id,
            'name' => $this->faker->word(),
            'description' => $this->faker->sentence(),
            'price' => $this->faker->randomFloat(2, 1, 100),
            'image_url' => $this->faker->imageUrl(640, 480, 'food'),
            'available' => $this->faker->boolean(80), // غالباً متاح
        ];
    }
}
