<?php

namespace Database\Seeders;

use App\Models\Manager;
use App\Models\PurchaseBill;
use App\Models\Supplier;
use App\Models\SupplyOffer;
use Illuminate\Database\Seeder;

class PurchaseBillsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $supplyOffers = SupplyOffer::all();
        $managers = Manager::all();
        $suppliers = Supplier::all();

        foreach ($supplyOffers as $offer) {
            PurchaseBill::factory()->create([
                'supplyOffer_id' => $offer->id,
                'manager_id' => $managers->random()->id,
                'supplier_id' => $suppliers->random()->id,
            ]);
        }
    }
}
