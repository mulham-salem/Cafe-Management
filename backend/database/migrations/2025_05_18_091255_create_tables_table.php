<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tables', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('manager_id');
            $table->integer('number')->unique();
            $table->integer('capacity');
            $table->string('status');
            $table->timestamps();
            $table->foreign('manager_id')->references('id')->on('managers')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tables');
    }
};
