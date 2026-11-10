<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration 3: Bookings Table (Tourist Reservations & Payment Proof Uploads)
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number', 32)->unique()->index();
            $table->foreignId('homestay_id')->constrained('homestays')->cascadeOnDelete();
            $table->foreignId('tourist_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('guest_full_name', 120);
            $table->string('guest_phone', 25);
            $table->string('guest_email', 150);
            $table->date('check_in');
            $table->date('check_out');
            $table->unsignedSmallInteger('nights_count')->default(1);
            $table->unsignedTinyInteger('guests_count')->default(2);
            $table->decimal('total_price', 10, 2);
            $table->text('special_requests')->nullable();
            // Payment proof upload metadata (JPG/PNG/PDF only, max 5MB)
            $table->string('payment_proof_path');
            $table->string('payment_proof_mime', 60)->nullable();
            $table->unsignedInteger('payment_proof_size')->nullable();
            $table->enum('status', ['Pending', 'Approved', 'Rejected'])->default('Pending')->index();
            // 24-Hour Operator Verification Countdown Deadline
            $table->timestamp('verification_deadline')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->text('operator_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};

