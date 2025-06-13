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
            $table->unsignedBigInteger('supplyRequest_id')->nullable();
            $table->foreignid('manager_id')->nullable()->constrained('managers')->cascadeOnDelete();
            $table->foreignid('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('sent_by');
            $table->string('purpose');
            $table->text('message');
            $table->dateTime('createdAt');
            $table->foreign('supplyRequest_id')->references('id')->on('supply_requests');
            $table->boolean('seen')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
