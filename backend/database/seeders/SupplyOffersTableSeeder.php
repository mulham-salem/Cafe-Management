<?php

namespace Database\Seeders;

use App\Models\SupplyOffer;
use Illuminate\Database\Seeder;

class SupplyOffersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        SupplyOffer::factory()->count(10)->create();

    }
}
