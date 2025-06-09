<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Manager;
use App\Models\MenuItem;
use App\Models\Promotion;
use Illuminate\Database\Seeder;

class MenuItemsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $managers = Manager::all();
        $categories = Category::all();
        $promotions = Promotion::all();

        foreach ($managers as $manager) {
            for ($i = 0; $i < 4; $i++) {
                MenuItem::factory()->create([
                    'manager_id' => $manager->id,
                    'promotion_id' => $promotions->isNotEmpty() ? $promotions->random()->id : null,

                    'category_id' => $categories->random()->id,
                ]);
            }
        }
    }
}
