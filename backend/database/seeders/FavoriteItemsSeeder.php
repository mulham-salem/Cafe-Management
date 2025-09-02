<?php

namespace Database\Seeders;

use App\Models\FavoriteItem;
use Illuminate\Database\Seeder;

class FavoriteItemsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        FavoriteItem::factory()->count(20)->create();
    }
}
