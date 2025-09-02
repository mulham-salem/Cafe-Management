<?php

namespace Database\Seeders;

use App\Models\LoyalityAccount;
use Illuminate\Database\Seeder;

class LoyalityAccountsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        LoyalityAccount::factory()->count(20)->create();
    }
}
