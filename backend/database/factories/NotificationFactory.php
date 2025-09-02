<?php

namespace Database\Factories;

use App\Models\Manager;
use App\Models\Notification;
use App\Models\SupplyRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class NotificationFactory extends Factory
{
    protected $model = Notification::class;

    public function definition()
    {
        return [
            'user_id' => User::inRandomOrder()->first()?->id,
            'manager_id' => Manager::inRandomOrder()->first()?->id,
            'supplyRequest_id' => SupplyRequest::inRandomOrder()->first()?->id,
            'sent_by' => $this->faker->name(),
            'purpose' => $this->faker->sentence(3),
            'message' => $this->faker->paragraph(),
            'createdAt' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'seen' => $this->faker->boolean(50),
        ];
    }
}
