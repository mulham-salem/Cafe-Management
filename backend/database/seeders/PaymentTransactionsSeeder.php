<?php

namespace Database\Seeders;

use App\Models\PaymentTransaction;
use Illuminate\Database\Seeder;

class PaymentTransactionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        PaymentTransaction::factory()->count(20)->create();
    }
}
