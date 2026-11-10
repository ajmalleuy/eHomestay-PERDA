<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * ============================================================================
 * User Model (app/Models/User.php)
 * Represents the 3 user roles in the e-Homestay PERDA system:
 * 1. 'tourist'  - Searches homestays, books stays, uploads payment proofs
 * 2. 'operator' - Manages homestay units, blocks dates, verifies bookings
 * 3. 'officer'  - BPE PERDA Officer (Admin) who monitors & generates reports
 * ============================================================================
 */
class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',                 // 'tourist', 'operator', or 'officer'
        'promo_email_opt_in',   // Tourist opt-in: "I agree to receive promotional emails from PERDA"
        'is_verified_admin',    // True only for verified official @perda.gov.my officers
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at'  => 'datetime',
        'promo_email_opt_in' => 'boolean',
        'is_verified_admin'  => 'boolean',
    ];

    /**
     * Check if the user is a verified official BPE PERDA Officer (Admin).
     * Admin login strictly requires a registered & verified @perda.gov.my email.
     */
    public function isVerifiedPerdaOfficer(): bool
    {
        return $this->role === 'officer'
            && $this->is_verified_admin === true
            && $this->email_verified_at !== null
            && str_ends_with(strtolower($this->email), '@perda.gov.my');
    }

    /**
     * Relationship: A Homestay Operator can manage multiple Homestay units.
     */
    public function homestays()
    {
        return $this->hasMany(Homestay::class, 'operator_id');
    }

    /**
     * Relationship: A Tourist can make multiple Bookings.
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class, 'tourist_id');
    }
}

