<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id(); // bigint unsigned auto increment

            $table->foreignId('supplyRequest_id')
                ->nullable()
                ->constrained('supply_requests');

            $table->foreignId('manager_id')
                ->nullable()
                ->constrained('managers')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('sent_by', 255);
            $table->string('purpose', 255);
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
