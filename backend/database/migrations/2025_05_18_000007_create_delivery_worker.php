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
        Schema::create('delivery_worker', function (Blueprint $table) {
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete()
                ->primary(); // user_id هو الـ PK لأنه علاقة 1-1 مع users

            $table->string('transport', 50);
            $table->string('license', 20);
            $table->enum('status', ['Available', 'OnDelivery', 'Inactive'])->default('Available');
            $table->decimal('rating', 2, 1)->nullable(); // مثل 4.5
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_worker');
    }
};
