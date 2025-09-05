<?php

namespace Database\Factories;

use App\Models\Manager;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ManagerFactory extends Factory
{
    protected $model = Manager::class;

    public function definition(): array
    {
        return [
            'username' => $this->faker->unique()->userName,
            'password' => Hash::make('password123'), // كلمة سر افتراضية
            'name' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'role' => 'manager', // ثابت حسب الـ migration
            'remember_token' => Str::random(10),
        ];
    }
}
