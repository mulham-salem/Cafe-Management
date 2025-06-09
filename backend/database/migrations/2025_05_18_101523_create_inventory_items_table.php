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
            $table->string('name');
            $table->integer('quantity');
            $table->string('unit')->nullable();
            $table->string('note')->nullable();
            $table->integer('threshold_level')->nullable();
            $table->date('expiry_date')->nullable();
            $table->timestamps();
            $table->foreign('manager_id')->references('id')->on('managers')->onDelete('cascade');
            $table->foreign('purchaseBill_id')->references('id')->on('purchase_bills')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};
