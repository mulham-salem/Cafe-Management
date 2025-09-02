<?php

namespace Database\Seeders;

use App\Models\SalesReport;
use Illuminate\Database\Seeder;

class SalesReportsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        SalesReport::factory()->count(10)->create();
    }
}
