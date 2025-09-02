<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bills', function (Blueprint $table) {
            $table->id(); // bigint unsigned auto increment

            $table->foreignId('order_id')
                ->constrained('orders')
                ->cascadeOnDelete();

            $table->decimal('total_amount', 8, 2);
            $table->enum('payment_method', ['Cash', 'Card', 'Online']);
            $table->dateTime('date_issued');
            $table->decimal('used_loyalty_points', 8, 2)->default(0.00);

            $table->timestamps(); // created_at, updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bills');
    }
};
