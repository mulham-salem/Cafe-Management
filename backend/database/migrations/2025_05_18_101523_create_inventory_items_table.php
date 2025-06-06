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
            $table->unsignedBigInteger('manager_id');
            $table->unsignedBigInteger('purchaseBill_id')->nullable();
            $table->unsignedBigInteger('promotion_id')->nullable();
            $table->string('name');
            $table->integer('quantity');
            $table->string('unit');
            $table->integer('threshold_level');
            $table->date('expiry_date');
            $table->timestamps();
            $table->foreign('manager_id')->references('id')->on('managers')->onDelete('cascade');
            $table->foreign('purchaseBill_id')->references('id')->on('purchase_bills')->onDelete('cascade');
            $table->foreign('promotion_id')->references('id')->on('promotions')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};
