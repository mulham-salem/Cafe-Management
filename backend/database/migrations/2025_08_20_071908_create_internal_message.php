<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('internal_message', function (Blueprint $table) {
            $table->id(); // bigint unsigned auto increment

            $table->foreignId('sender_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('receiver_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('subject', 50);
            $table->text('body');
            $table->string('sender_name', 50);
            $table->string('receiver_name', 50);
            $table->dateTime('sent_at');
            $table->dateTime('read_at')->nullable();
            $table->boolean('unread')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('internal_message');
    }
};
