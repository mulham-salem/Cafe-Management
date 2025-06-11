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
                'supply_offer_id' => $offer->id,
                'inventory_item_id' => $inventoryItems->random()->id,
            ]);
        }
    }
}
