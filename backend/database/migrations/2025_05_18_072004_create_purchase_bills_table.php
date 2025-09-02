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
            $table->foreignId('manager_id')->constrained('managers')->onDelete('cascade');
            $table->foreignId('supply_offer_id')->constrained('supply_offers')->onDelete('cascade');
            $table->foreignId('supplier_id')->constrained('suppliers')->onDelete('cascade');
            $table->decimal('unit_price', 5, 2)->nullable();
            $table->decimal('total_amount', 10, 2);
            $table->dateTime('purchase_date');
            $table->timestamps();

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_bills');
    }
};
