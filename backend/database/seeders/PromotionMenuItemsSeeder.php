<?php

namespace Database\Seeders;

use App\Models\PromotionMenuItem;
use Illuminate\Database\Seeder;

class PromotionMenuItemsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        PromotionMenuItem::factory()->count(50)->create();
    }
}
