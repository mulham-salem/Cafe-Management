<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::create('menu_inventory_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('menuItem_id');
            $table->unsignedBigInteger('inventoryItem_id');
            $table->float('quantity_used');
            $table->string('unit');
            $table->timestamps();
            $table->foreign('menuItem_id')->references('id')->on('menu_items')->onDelete('cascade');
            $table->foreign('inventoryItem_id')->references('id')->on('inventory_items')->onDelete('cascade');
        });
    }


    public function down(): void
    {
        Schema::dropIfExists('menu_inventory_items');
    }
};
