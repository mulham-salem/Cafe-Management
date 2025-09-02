<?php

namespace Database\Seeders;

use App\Models\SupplyOfferItem;
use Illuminate\Database\Seeder;

class SupplyOfferItemsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        SupplyOfferItem::factory()->count(20)->create();

    }
}
