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
        Schema::create('order_control', function (Blueprint $table) {
            $table->id(); // bigint unsigned auto increment

            $table->foreignId('employee_id')
                ->constrained('employees') // أو 'users' إذا اعتمدنا الوراثة
                ->cascadeOnDelete();

            $table->enum('status', ['open', 'closed'])->default('open');
            $table->timestamp('timestamp')->useCurrent()->useCurrentOnUpdate();
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_control');
    }
};
