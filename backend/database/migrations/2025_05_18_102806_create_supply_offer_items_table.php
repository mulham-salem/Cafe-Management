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
            $table->unsignedBigInteger('supply_offer_id');
            $table->unsignedBigInteger('inventory_item_id')->nullable();
            $table->string('name')->nullable();
            $table->integer('quantity');
            $table->string('unit');
            $table->float('unit_price');
            $table->float('total_price');
            $table->timestamps();
            $table->foreign('supply_offer_id')->references('id')->on('supply_offers')->onDelete('cascade');
            $table->foreign('inventory_item_id')->references('id')->on('inventory_items')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supply_offer_items');
    }
};
