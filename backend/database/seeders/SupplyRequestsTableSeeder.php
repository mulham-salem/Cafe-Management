<?php

namespace Database\Seeders;

use App\Models\Manager;
use App\Models\SupplyRequest;
use Illuminate\Database\Seeder;

class SupplyRequestsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $managers = Manager::all();

        foreach ($managers as $manager) {
            SupplyRequest::factory(2)->create(['manager_id' => $manager->id]);
        }
    }
}
