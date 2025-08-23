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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            // Custom alphanumeric order code (e.g. ORD123ABC)
            $table->string('order_code')->unique();

            // Relationship to user & dish
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('dish_id')->constrained()->onDelete('cascade');
            $table->string('order_group_id')->nullable();

            // Order details
            $table->string('customer_name');      // Name of the user for delivery
            $table->text('customer_address');     // Address of the user
            $table->integer('quantity');
            $table->text('notes')->nullable();
            $table->enum('payment', ['COD', 'GCash']);
            $table->decimal('total_amount', 8, 2);

            // Order status
            $table->enum('status', ['Pending', 'Completed', 'Cancelled'])
                  ->default('Pending');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
