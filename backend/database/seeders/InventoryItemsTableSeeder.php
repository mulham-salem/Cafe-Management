<?php

namespace Database\Seeders;

use App\Models\InventoryItem;
use App\Models\Manager;
use App\Models\Promotion;
use App\Models\PurchaseBill;
use Illuminate\Database\Seeder;

class InventoryItemsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $managers = Manager::all();
        $purchaseBills = PurchaseBill::all();
        $promotions = Promotion::all();

        foreach ($managers as $manager) {
            for ($i = 0; $i < 4; $i++) {
                InventoryItem::factory()->create([
                    'manager_id' => $manager->id,
                    'purchaseBill_id' => $purchaseBills->isNotEmpty() ? $purchaseBills->random()->id : null,
                    'promotion_id' => $promotions->isNotEmpty() ? $promotions->random()->id : null,
                ]);
            }
        }
    }
}
