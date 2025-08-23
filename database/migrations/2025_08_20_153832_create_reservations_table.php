<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('user_name');
            $table->string('user_email');
            $table->unsignedBigInteger('table_id');
            $table->integer('guest_count');
            $table->date('reservation_date');
            $table->time('reservation_time');
            $table->timestamp('reserved_at');
            $table->string('status')->default('pending');
            $table->timestamps();

            $table->foreign('table_id')->references('id')->on('tables');
            
            // Prevent double booking of same table at same date/time
            $table->unique(['table_id', 'reservation_date', 'reservation_time'], 'unique_table_reservation');
        });
    }

    public function down()
    {
        Schema::dropIfExists('reservations');
    }
};