<?php

namespace Database\Seeders;

use App\Models\Manager;
use App\Models\Promotion;
use Illuminate\Database\Seeder;

class PromotionsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $managers = Manager::all();

        foreach ($managers as $manager) {
            Promotion::factory(2)->create([
                'manager_id' => $manager->id,
            ]);
        }
    }
}
