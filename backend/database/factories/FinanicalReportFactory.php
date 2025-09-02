<?php

namespace Database\Factories;

use App\Models\FinanicalReport;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\FinanicalReport>
 */
class FinanicalReportFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = FinanicalReport::class;

    public function definition()
    {
        $start = $this->faker->dateTimeBetween('-1 year', 'now');
        $end = $this->faker->dateTimeBetween($start, 'now');

        $totalRevenue = $this->faker->randomFloat(2, 5000, 50000);
        $totalExpenses = $this->faker->randomFloat(2, 1000, $totalRevenue);
        $netProfit = $totalRevenue - $totalExpenses;

        return [
            'type' => $this->faker->randomElement(['daily', 'weekly', 'monthly']),
            'start_date' => $this->faker->date(),
            'end_date' => $this->faker->date(),
            'data' => [
                'net_profit' => $this->faker->randomFloat(2, 1000, 10000),
                'total_revenue' => $this->faker->randomFloat(2, 5000, 20000),
                'total_expenses' => $this->faker->randomFloat(2, 1000, 15000),
                'breakdown' => [
                    [
                        'period' => $this->faker->date(),
                        'revenue' => $this->faker->randomFloat(2, 200, 5000),
                        'expenses' => $this->faker->randomFloat(2, 100, 3000),
                    ],
                    [
                        'period' => $this->faker->date(),
                        'revenue' => $this->faker->randomFloat(2, 200, 5000),
                        'expenses' => $this->faker->randomFloat(2, 100, 3000),
                    ],
                ],
            ],
        ];
    }
}
