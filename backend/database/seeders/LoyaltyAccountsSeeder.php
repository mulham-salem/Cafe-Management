<?php

namespace Database\Seeders;

use App\Models\LoyaltyAccount;
use Illuminate\Database\Seeder;

class LoyaltyAccountsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        LoyaltyAccount::factory()->count(20)->create();
    }
}
