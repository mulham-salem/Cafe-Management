<?php

namespace Database\Seeders;

use App\Models\InternalMessage;
use Illuminate\Database\Seeder;

class InternalMessagesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        InternalMessage::factory()->count(20)->create();
    }
}
