<?php

namespace Database\Seeders;

use App\Models\OrderControl;
use Illuminate\Database\Seeder;

class OrderControlSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        OrderControl::factory()->count(15)->create();
    }
}
