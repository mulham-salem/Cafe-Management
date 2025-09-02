<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tables', function (Blueprint $table) {
            $table->id(); // bigint unsigned auto increment

            $table->integer('number');
            $table->integer('capacity');
            $table->enum('status', ['available', 'reserved', 'cleaning'])->default('available');

            $table->timestamps(); // created_at, updated_at

            $table->foreignId('employee_id')
                ->nullable()
                ->constrained('employees') // أو 'users' إذا اعتمدنا الوراثة
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tables');
    }
};
