<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Manager;
use App\Models\MenuItem;
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

        foreach ($managers as $manager) {
            for ($i = 0; $i < 4; $i++) {
                MenuItem::factory()->create([
                    'manager_id' => $manager->id,
                    'category_id' => $categories->random()->id,
                ]);
            }
        }
    }
}
