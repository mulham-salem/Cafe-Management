<?php

namespace Database\Seeders;

use App\Models\FinanicalReport;
use Illuminate\Database\Seeder;

class FinanicalReportsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        FinanicalReport::factory()->count(10)->create();
    }
}
