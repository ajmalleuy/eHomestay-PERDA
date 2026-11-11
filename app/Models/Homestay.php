<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * ============================================================================
 * Homestay Model (app/Models/Homestay.php)
 * Represents a local PERDA Homestay unit in Penang.
 * ============================================================================
 */
class Homestay extends Model
{
    use HasFactory;

    protected $fillable = [
        'operator_id',
        'name',
        'slug',
        'district',
        'location_address',
        'description',
        'price_per_night',
        'max_guests',
        'bedrooms',
        'bathrooms',
        'facilities',
        'cover_image',
        'gallery_images',
        'is_active',
    ];

    protected $casts = [
        'price_per_night' => 'decimal:2',
        'facilities'      => 'array',
        'gallery_images'  => 'array',
        'is_active'       => 'boolean',
    ];

    /**
     * Relationship: Belongs to a Homestay Operator (User).
     */
    public function operator()
    {
        return $this->belongsTo(User::class, 'operator_id');
    }

    /**
     * Relationship: Has many tourist Bookings.
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Relationship: Has many operator-blocked dates (maintenance / personal use).
     */
    public function blockedDates()
    {
        return $this->hasMany(BlockedDate::class);
    }

    /**
     * Helper: Check if this homestay is available between check-in and check-out dates.
     */
    public function isAvailableForDates(string $checkIn, string $checkOut): bool
    {
        $hasOverlappingBooking = $this->bookings()
            ->whereIn('status', ['Pending', 'Approved'])
            ->where('check_in', '<', $checkOut)
            ->where('check_out', '>', $checkIn)
            ->exists();

        if ($hasOverlappingBooking) {
            return false;
        }

        $hasBlockedDate = $this->blockedDates()
            ->whereBetween('blocked_date', [$checkIn, $checkOut])
            ->exists();

        return !$hasBlockedDate;
    }
}

