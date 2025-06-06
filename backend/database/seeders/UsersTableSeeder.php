<?php

namespace Database\Seeders;

use App\Models\Manager;
use App\Models\User;
use Illuminate\Database\Seeder;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $managers = Manager::all();

        for ($i = 0; $i < 9; $i++) {
            User::factory()->create([
                'manager_id' => $managers->random()->id,
            ]);
        }
    }
}
