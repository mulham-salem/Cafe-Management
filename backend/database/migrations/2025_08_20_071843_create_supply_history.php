<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('supply_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supply_request_id')->constrained('supply_requests')->onDelete('cascade');
            $table->foreignId('supply_offer_id')->constrained('supply_offers')->onDelete('cascade');
            $table->enum('status', ['pending', 'accepted', 'rejected']);
            $table->enum('type', ['supply request', 'supply offer']);
            $table->dateTime('supply_date');
            $table->string('item_name', 30);
            $table->unsignedBigInteger('item_quantity');
            $table->string('reject_reason', 100)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supply_history');
    }
};
