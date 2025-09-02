<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\LoyalityAccount;
use Illuminate\Database\Eloquent\Factories\Factory;

class LoyalityAccountFactory extends Factory
{
    protected $model = LoyalityAccount::class;

    public function definition()
    {
        $customer = Customer::doesntHave('loyalityAccount')->inRandomOrder()->first();

        return [
            'customer_id' => $customer ? $customer->id : Customer::factory()->create()->id,
            'points_balance' => $this->faker->randomFloat(2, 0, 1000),
            'tier' => $this->faker->randomElement(['Bronze', 'Silver', 'Gold', 'Platinum']),
            'last_update' => $this->faker->dateTimeThisMonth(),

        ];
    }
}
