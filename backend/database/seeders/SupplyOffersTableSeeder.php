<?php

namespace Database\Seeders;

use App\Models\Supplier;
use App\Models\SupplyOffer;
use Illuminate\Database\Seeder;

class SupplyOffersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $suppliers = Supplier::all();

        foreach ($suppliers as $supplier) {
            SupplyOffer::factory(2)->create(['supplier_id' => $supplier->id]);
        }
    }
}
