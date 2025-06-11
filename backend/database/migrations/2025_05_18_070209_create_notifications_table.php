<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignid('manager_id')->nullable()->constrained('managers')->cascadeOnDelete();
            $table->foreignid('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->text('message');
            $table->dateTime('createdAt');
            $table->boolean('seen')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
