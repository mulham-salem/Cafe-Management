<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id(); // bigint unsigned auto increment

            $table->foreignId('customer_id')
                ->nullable()
                ->constrained('customers')
                ->cascadeOnDelete();

            $table->foreignId('employee_id')
                ->nullable()
                ->constrained('employees')
                ->cascadeOnDelete();

            $table->dateTime('createdAt');
            $table->dateTime('confirmedAt');
            $table->enum('status', ['pending', 'confirmed', 'preparing', 'ready', 'delivered'])->default('pending');
            $table->string('note', 100)->nullable();

            $table->timestamps(); // created_at, updated_at

            $table->boolean('onHold')->default(false);
            $table->enum('pickup_method', ['dineIn', 'takeaway', 'delivery'])->default('dineIn');
            $table->dateTime('pickup_time')->nullable();
            $table->decimal('rating_score', 2, 1)->nullable();
            $table->string('rating_comment', 200)->nullable();
            $table->decimal('used_loyalty_points', 8, 2)->nullable();
            $table->boolean('repreparation_request')->default(false);
            $table->string('repreparation_reason', 200)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
