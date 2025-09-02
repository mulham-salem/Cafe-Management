<?php

namespace Database\Factories;

use App\Models\InventoryItem;
use App\Models\SupplyOffer;
use App\Models\SupplyOfferItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class SupplyOfferItemFactory extends Factory
{
    protected $model = SupplyOfferItem::class;

    public function definition()
    {
        $supplyOffers = SupplyOffer::all();
        $inventoryItems = InventoryItem::all();

        $quantity = $this->faker->numberBetween(1, 50);
        $unitPrice = $this->faker->randomFloat(2, 1, 100);
        $totalPrice = $quantity * $unitPrice;

        return [
            'supply_offer_id' => $supplyOffers->isNotEmpty() ? $supplyOffers->random()->id : null,
            'inventory_item_id' => $inventoryItems->isNotEmpty() ? $inventoryItems->random()->id : null,
            'name' => $this->faker->optional()->word(),
            'quantity' => $quantity,
            'unit' => $this->faker->randomElement(['kg', 'g', 'liter', 'ml', 'dozen', 'box', 'piece']),
            'unit_price' => $unitPrice,
            'total_price' => $totalPrice,
        ];
    }
}
