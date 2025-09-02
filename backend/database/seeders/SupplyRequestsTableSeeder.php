<?php

namespace Database\Seeders;

use App\Models\SupplyRequest;
use Illuminate\Database\Seeder;

class SupplyRequestsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        SupplyRequest::factory()->count(15)->create();

    }
}
