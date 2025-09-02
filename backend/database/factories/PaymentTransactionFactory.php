<?php

namespace Database\Factories;

use App\Models\Bill;
use App\Models\PaymentTransaction;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentTransactionFactory extends Factory
{
    protected $model = PaymentTransaction::class;

    public function definition()
    {
        $bills = Bill::all();

        return [
            'bill_id' => $bills->isNotEmpty() ? $bills->random()->id : null,
            'method' => $this->faker->randomElement(['VisaCard', 'PayPal', 'CreditCard', 'GooglePay', 'SamsungPay', 'Cash']),
            'status' => $this->faker->randomElement(['pending', 'completed', 'failed', 'refunded']),
            'transaction_code' => strtoupper($this->faker->bothify('TXN####??')),
            'processed_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
        ];
    }
}
