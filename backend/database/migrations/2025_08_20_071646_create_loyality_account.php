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
        Schema::create('loyality_account', function (Blueprint $table) {
            $table->id(); // bigint unsigned auto increment

            $table->foreignId('customer_id')
                ->constrained('customers')
                ->cascadeOnDelete()
                ->unique(); // علاقة One-to-One

            $table->decimal('points_balance', 8, 2);
            $table->enum('tier', ['Bronze', 'Silver', 'Gold', 'Platinum'])->default('Bronze');
            $table->dateTime('last_update');
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loyality_account');
    }
};
