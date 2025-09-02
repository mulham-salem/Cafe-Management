<?php

namespace Database\Factories;

use App\Models\InventoryItem;
use App\Models\Manager;
use App\Models\PurchaseBill;
use Illuminate\Database\Eloquent\Factories\Factory;

class InventoryItemFactory extends Factory
{
    protected $model = InventoryItem::class;

    public function definition()
    {
        $manager = Manager::inRandomOrder()->first();
        $purchaseBill = PurchaseBill::inRandomOrder()->first(); // يمكن أن يكون nullable

        return [
            'manager_id' => $manager->id,
            'purchaseBill_id' => $this->faker->optional()->randomElement([$purchaseBill->id ?? null]),
            'name' => $this->faker->word(),
            'quantity' => $this->faker->numberBetween(1, 100),
            'unit' => $this->faker->randomElement(['kg', 'g', 'liter', 'ml', 'dozen', 'box', 'piece']),
            'note' => $this->faker->optional()->sentence(),
            'threshold_level' => $this->faker->numberBetween(1, 20),
            'expiry_date' => $this->faker->dateTimeBetween('now', '+1 year')->format('Y-m-d'),
        ];
    }
}
