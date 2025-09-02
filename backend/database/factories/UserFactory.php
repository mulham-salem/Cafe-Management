<?php

namespace Database\Factories;

use App\Models\Manager;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition()
    {
        $managers = Manager::all();

        return [
            'manager_id' => $managers->isNotEmpty() ? $managers->random()->id : null,
            'name' => $this->faker->name(),
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'username' => $this->faker->unique()->userName(),
            'email' => $this->faker->unique()->safeEmail(),
            'password' => bcrypt('password'), // كلمة مرور افتراضية
            'role' => $this->faker->randomElement(['customer', 'employee', 'supplier', 'deliveryWorker']),
            'image_url' => $this->faker->imageUrl(),
            'remember_token' => Str::random(10),
        ];
    }

    // يمكن إنشاء نوع محدد من المستخدم بسهولة
    public function customer()
    {
        return $this->state(fn () => ['role' => 'customer']);
    }

    public function employee()
    {
        return $this->state(fn () => ['role' => 'employee']);
    }

    public function supplier()
    {
        return $this->state(fn () => ['role' => 'supplier']);
    }

    public function deliveryWorker()
    {
        return $this->state(fn () => ['role' => 'deliveryWorker']);
    }
}
