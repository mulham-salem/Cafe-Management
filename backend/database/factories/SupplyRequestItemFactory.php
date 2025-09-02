<?php

namespace Database\Factories;

use App\Models\InventoryItem;
use App\Models\SupplyRequest;
use App\Models\SupplyRequestItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class SupplyRequestItemFactory extends Factory
{
    protected $model = SupplyRequestItem::class;

    public function definition()
    {
        $supplyRequests = SupplyRequest::all();
        $inventoryItems = InventoryItem::all();

        return [
            'supplyRequest_id' => $supplyRequests->isNotEmpty() ? $supplyRequests->random()->id : null,
            'inventory_item_id' => $inventoryItems->isNotEmpty() ? $inventoryItems->random()->id : null,
            'quantity' => $this->faker->numberBetween(1, 50),
        ];
    }
}
