<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {

        Schema::create('users', function (Blueprint $table) {
            $table->id(); // bigint unsigned auto_increment primary key
            $table->foreignId('manager_id')
                ->constrained('managers')
                ->cascadeOnDelete(); // FK -> managers.id

            $table->string('full_name', 255);
            $table->string('username', 50);
            $table->string('email', 255)->unique();
            $table->string('password', 255);

            $table->enum('role', [
                'manager',
                'customer',
                'employee',
                'supplier',
                'deliveryWorker',
            ])->default('customer');

            $table->rememberToken(); // varchar(100) nullable

            $table->timestamps(); // created_at, updated_at

            $table->string('first_name', 50);
            $table->string('last_name', 50)->nullable();
            $table->string('image_url', 2083)->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('users');

    }
};
