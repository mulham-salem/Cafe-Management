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
        Schema::create('live_location', function (Blueprint $table) {
            $table->id(); // bigint unsigned auto increment

            $table->foreignId('delivery_order_id')
                ->constrained('delivery_order')
                ->cascadeOnDelete();

            $table->double('latitude');
            $table->double('longitude');
            $table->string('description', 100)->nullable();
            $table->timestamp('timestamp')->useCurrent()->useCurrentOnUpdate();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('live_location');
    }
};
