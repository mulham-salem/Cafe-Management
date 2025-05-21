<?php

namespace Database\Seeders;

use App\Models\InventoryItem;
use App\Models\SupplyOffer;
use App\Models\SupplyOfferItem;
use Illuminate\Database\Seeder;

class SupplyOfferItemsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $offers = SupplyOffer::all();
        $inventoryItems = InventoryItem::all();

        foreach ($offers as $offer) {
            SupplyOfferItem::factory(4)->create([
                'supplyOffer_id' => $offer->id,
                'inventoryItem_id' => $inventoryItems->random()->id,
            ]);
        }
    }
}
