<?php

namespace Database\Factories;

use App\Models\Manager;
use App\Models\PurchaseBill;
use App\Models\Supplier;
use App\Models\SupplyOffer;
use Illuminate\Database\Eloquent\Factories\Factory;

class PurchaseBillFactory extends Factory
{
    protected $model = PurchaseBill::class;

    public function definition()
    {
        $managers = Manager::all();
        $suppliers = Supplier::all();
        $supplyOffers = SupplyOffer::all();

        return [
            'manager_id' => $managers->isNotEmpty() ? $managers->random()->id : null,
            'supplier_id' => $suppliers->isNotEmpty() ? $suppliers->random()->id : null,
            'supply_offer_id' => $supplyOffers->isNotEmpty() ? $supplyOffers->random()->id : null,
            'unit_price' => $this->faker->randomFloat(2, 1, 100),
            'total_amount' => $this->faker->randomFloat(2, 50, 1000),
            'purchase_date' => $this->faker->dateTimeBetween('-1 year', 'now'),
        ];
    }
}
