<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->foreignId('manager_id')->constrained('managers')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->double('price');
            $table->string('image_url', 2083)->nullable();
            $table->boolean('available')->default(true);
            $table->timestamps();

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_items');
    }
};
