<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::create('supply_offers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('supplier_id');
            $table->string('title');
            $table->float('total_price');
            $table->dateTime('delivery_date');
            $table->text('note')->nullable();
            $table->string('status');
            $table->timestamps();
            $table->foreign('supplier_id')->references('id')->on('suppliers')->onDelete('cascade');
        });
    }


    public function down(): void
    {
        Schema::dropIfExists('supply_offers');
    }
};
