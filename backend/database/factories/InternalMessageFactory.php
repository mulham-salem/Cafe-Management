<?php

namespace Database\Factories;

use App\Models\InternalMessage;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class InternalMessageFactory extends Factory
{
    protected $model = InternalMessage::class;

    public function definition()
    {
        $sender = User::inRandomOrder()->first();
        $receiver = User::where('id', '!=', $sender->id)->inRandomOrder()->first();

        return [
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'subject' => $this->faker->sentence(3),
            'body' => $this->faker->paragraph(),
            'sender_name' => $sender->full_name,
            'receiver_name' => $receiver->full_name,
            'sent_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'read_at' => $this->faker->optional()->dateTimeBetween('sent_at', 'now'),
        ];
    }
}
