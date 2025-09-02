<?php

namespace Database\Seeders;

use App\Models\DeliveryWorker;
use Illuminate\Database\Seeder;

class DeliveryWorkersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DeliveryWorker::factory()->count(10)->create();
    }
}
