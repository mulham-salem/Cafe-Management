<?php

namespace Database\Seeders;

use App\Models\SupplyRequestItem;
use Illuminate\Database\Seeder;

class SupplyRequestItemsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        SupplyRequestItem::factory()->count(50)->create();

    }
}
