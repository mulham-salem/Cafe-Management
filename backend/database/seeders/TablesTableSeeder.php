<?php

namespace Database\Seeders;

use App\Models\Manager;
use App\Models\Table;
use Illuminate\Database\Seeder;

class TablesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $managers = Manager::all();

        foreach ($managers as $manager) {
            Table::factory(2)->create([
                'manager_id' => $manager->id,
            ]);
        }
    }
}
