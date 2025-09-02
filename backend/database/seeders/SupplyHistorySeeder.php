<?php

namespace Database\Seeders;

use App\Models\SupplyHistory;
use Illuminate\Database\Seeder;

class SupplyHistorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        SupplyHistory::factory()->count(10)->create();

    }
}
