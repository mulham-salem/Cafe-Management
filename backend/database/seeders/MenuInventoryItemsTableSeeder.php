<?php

namespace Database\Seeders;

use App\Models\MenuInventoryItem;
use Illuminate\Database\Seeder;

class MenuInventoryItemsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        MenuInventoryItem::factory()->count(20)->create();

    }
}
