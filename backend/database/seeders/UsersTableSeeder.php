<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::factory()->count(10)->create();

        // مثال على إنشاء مستخدمين نوع محدد
        User::factory()->customer()->count(5)->create();
        User::factory()->employee()->count(5)->create();
        User::factory()->supplier()->count(3)->create();
        User::factory()->deliveryWorker()->count(3)->create();
    }
}
