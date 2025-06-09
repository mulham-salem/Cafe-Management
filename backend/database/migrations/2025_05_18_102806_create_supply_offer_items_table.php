<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('supply_offer_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('supplyOffer_id');
            $table->unsignedBigInteger('inventoryItem_id')->nullable();
            $table->string('name')->nullable();
            $table->integer('quantity');
            $table->float('unit_price');
            $table->float('total_price');
            $table->timestamps();
            $table->foreign('supplyOffer_id')->references('id')->on('supply_offers')->onDelete('cascade');
            $table->foreign('inventoryItem_id')->references('id')->on('inventory_items')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supply_offer_items');
    }
};
