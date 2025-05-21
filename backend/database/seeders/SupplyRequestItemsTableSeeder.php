<?php

namespace Database\Seeders;

use App\Models\InventoryItem;
use App\Models\SupplyRequest;
use App\Models\SupplyRequestItem;
use Illuminate\Database\Seeder;

class SupplyRequestItemsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $requests = SupplyRequest::all();
        $inventoryItems = InventoryItem::all();

        foreach ($requests as $request) {
            SupplyRequestItem::factory(4)->create([
                'supplyRequest_id' => $request->id,
                'inventoryItem_id' => $inventoryItems->random()->id,
            ]);
        }
    }
}
