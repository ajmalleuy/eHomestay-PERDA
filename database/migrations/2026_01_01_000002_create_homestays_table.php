<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration 2: Homestays Table (PERDA Inap Desa Units)
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('homestays', function (Blueprint $table) {
            $table->id();
            // 1 Operator owns strictly 1 Homestay (unique foreign key)
            $table->foreignId('operator_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('name', 150);
            $table->string('slug', 160)->unique();
            $table->string('district', 100)->index();
            $table->string('location_address', 255);
            $table->text('description');
            $table->decimal('price_per_night', 10, 2);
            $table->unsignedTinyInteger('max_guests')->default(4);
            $table->unsignedTinyInteger('bedrooms')->default(2);
            $table->unsignedTinyInteger('bathrooms')->default(2);
            $table->json('facilities')->nullable();
            $table->string('cover_image')->default('images/homestay-1.svg');
            $table->json('gallery_images')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('homestays');
    }
};

