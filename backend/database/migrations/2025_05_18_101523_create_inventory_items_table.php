<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('manager_id')->constrained('managers')->onDelete('cascade');
            $table->foreignId('purchaseBill_id')->nullable()->constrained('purchase_bills')->onDelete('cascade');
            $table->string('name', 50);
            $table->integer('quantity');
            $table->enum('unit', ['kg', 'g', 'liter', 'ml', 'dozen', 'box', 'piece'])->default('kg');
            $table->string('note', 255)->nullable();
            $table->integer('threshold_level')->nullable();
            $table->date('expiry_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};
