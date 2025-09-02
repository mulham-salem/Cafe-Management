<?php

namespace Database\Seeders;

use App\Models\LiveLocation;
use Illuminate\Database\Seeder;

class LiveLocationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        LiveLocation::factory()->count(30)->create();
    }
}
