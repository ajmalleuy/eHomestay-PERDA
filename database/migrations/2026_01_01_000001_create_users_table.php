<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration 1: Users Table (Tourists, Homestay Operators & BPE PERDA Officers)
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('email', 150)->unique();
            $table->string('phone', 25)->nullable();
            $table->enum('role', ['tourist', 'operator', 'officer'])->default('tourist');
            // Tourist opt-in: "I agree to receive promotional emails from PERDA"
            $table->boolean('promo_email_opt_in')->default(false);
            // Strict Admin Verification Flag for official @perda.gov.my officers
            $table->boolean('is_verified_admin')->default(false);
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};

