<?php

namespace Database\Seeders;

use App\Models\Notification;
use Illuminate\Database\Seeder;

class NotificationsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Notification::factory()->count(30)->create();
    }
}
