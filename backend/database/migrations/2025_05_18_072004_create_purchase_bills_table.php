<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_bills', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('manager_id');
            $table->unsignedBigInteger('supplyOffer_id');
            $table->unsignedBigInteger('supplier_id');
            $table->float('unit_price')->nullable();
            $table->float('total_amount');
            $table->dateTime('purchase_date');
            $table->timestamps();
            $table->foreign('manager_id')->references('id')->on('managers')->onDelete('cascade');
            $table->foreign('supplyOffer_id')->references('id')->on('supply_offers')->onDelete('cascade');
            $table->foreign('supplier_id')->references('id')->on('suppliers')->onDelete('cascade');

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_bills');
    }
};
