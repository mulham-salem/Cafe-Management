<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('managers', function (Blueprint $table) {
            $table->id()->primary();
            $table->string('username')->unique();
            $table->string('password');
            $table->string('name')->nullable();
            $table->string('email')->unique();
            $table->enum('role', ['Manager'])->default('Manager');
            $table->rememberToken();
            $table->timestamps();

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('managers');
    }
};
