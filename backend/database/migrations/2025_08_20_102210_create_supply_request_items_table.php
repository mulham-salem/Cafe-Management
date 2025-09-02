<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('supply_request_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('supplyRequest_id');
            $table->unsignedBigInteger('inventory_item_id');
            $table->integer('quantity');
            $table->timestamps();
            $table->foreign('supplyRequest_id')->references('id')->on('supply_requests')->onDelete('cascade');
            $table->foreign('inventory_item_id')->references('id')->on('inventory_items')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supply_request_items');
    }
};
