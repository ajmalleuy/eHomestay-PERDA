<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration 4: Blocked Dates Table (Operator Block Calendar Tool)
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blocked_dates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('homestay_id')->constrained('homestays')->cascadeOnDelete();
            $table->date('blocked_date');
            $table->string('reason', 120)->default('Scheduled Maintenance');
            $table->timestamps();

            $table->unique(['homestay_id', 'blocked_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blocked_dates');
    }
};

