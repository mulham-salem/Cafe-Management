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

         $first= $this->faker->firstName();
         $last= $this->faker->lastName();
        return [
            'first_name'=> $first,
            'last_name'=> $last,
            'full_name' => $first.''. $last,
            'manager_id' => $managers->isNotEmpty() ? $managers->random()->id : null,
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
