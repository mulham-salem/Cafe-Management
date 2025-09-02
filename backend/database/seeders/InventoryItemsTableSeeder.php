<?php

namespace Database\Seeders;

use App\Models\InventoryItem;
use Illuminate\Database\Seeder;

class InventoryItemsTableSeeder extends Seeder
{
    public function run(): void
    {
        // إنشاء 20 عنصر مخزون عشوائي
        InventoryItem::factory()->count(20)->create();
    }
}
