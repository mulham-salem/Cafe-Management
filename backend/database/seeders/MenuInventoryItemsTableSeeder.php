<?php

namespace Database\Seeders;

use App\Models\InventoryItem;
use App\Models\MenuInventoryItem;
use App\Models\MenuItem;
use Illuminate\Database\Seeder;

class MenuInventoryItemsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $menuItems = MenuItem::all();
        $inventoryItems = InventoryItem::all();

        foreach ($menuItems as $menu) {
            MenuInventoryItem::factory(4)->create([
                'menuItem_id' => $menu->id,
                'inventoryItem_id' => $inventoryItems->random()->id,
            ]);
        }
    }
}
