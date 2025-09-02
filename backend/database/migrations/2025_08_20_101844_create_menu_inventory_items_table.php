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
            $table->foreignId('menuItem_id')->constrained('menu_items')->onDelete('cascade');
            $table->foreignId('inventoryItem_id')->constrained('inventory_items')->onDelete('cascade');
            $table->integer('quantity_used');
            $table->enum('unit', ['kg', 'g', 'liter', 'ml', 'dozen', 'box', 'piece'])->default('kg');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_inventory_items');
    }
};
