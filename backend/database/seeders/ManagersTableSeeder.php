<?php

namespace Database\Seeders;

use App\Models\Manager;
use Illuminate\Database\Seeder;

class ManagersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Manager::create([
            'username' => 'admin',
            'password' => bcrypt('admin123'), // كلمة سر مشفرة
            'name' => 'System Admin',
            'email' => 'admin@example.com',
            'role' => 'Manager',
        ]);

        // إنشاء مدراء عشوائيين عبر الـ factory
        Manager::factory(5)->create();
    }
}
