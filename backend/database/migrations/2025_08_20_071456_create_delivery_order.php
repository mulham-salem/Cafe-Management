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
        Schema::create('delivery_order', function (Blueprint $table) {
            $table->id(); // bigint unsigned auto increment

            $table->foreignId('delivery_worker_id')
                ->constrained('delivery_worker', 'id')
                ->cascadeOnDelete();

            $table->foreignId('order_id')
                ->nullable()
                ->constrained('orders')
                ->nullOnDelete();

            $table->enum('status', ['Pending', 'Assigned', 'InTransit', 'Delivered'])->default('Pending');
            $table->decimal('cost', 5, 2);
            $table->string('address', 100);
            $table->dateTime('pickup_time');
            $table->dateTime('estimated_time');
            $table->decimal('rating_score', 2, 1)->nullable();
            $table->string('rating_comment', 200)->nullable();

            $table->timestamps(); // created_at, updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_order');
    }
};
