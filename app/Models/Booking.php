<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * ============================================================================
 * Booking Model (app/Models/Booking.php)
 * Stores tourist reservations, uploaded payment proofs (JPG/PNG/PDF <= 5MB),
 * reference numbers, and the 24-hour operator verification deadline.
 * ============================================================================
 */
class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference_number',
        'homestay_id',
        'tourist_id',
        'guest_full_name',
        'guest_phone',
        'guest_email',
        'check_in',
        'check_out',
        'nights_count',
        'guests_count',
        'total_price',
        'special_requests',
        'payment_proof_path',
        'payment_proof_mime',
        'payment_proof_size',
        'status',                 // 'Pending', 'Approved', 'Rejected'
        'verification_deadline',  // Created_at + 24 hours for operator verification
        'verified_at',
        'operator_notes',
    ];

    protected $casts = [
        'check_in'              => 'date',
        'check_out'             => 'date',
        'total_price'           => 'decimal:2',
        'verification_deadline' => 'datetime',
        'verified_at'           => 'datetime',
    ];

    /**
     * Generate a unique PERDA booking reference number (e.g., PERDA-2026-84920).
     */
    public static function generateReferenceNumber(): string
    {
        do {
            $ref = 'PERDA-' . date('Y') . '-' . random_int(10000, 99999);
        } while (self::where('reference_number', $ref)->exists());

        return $ref;
    }

    /**
     * Calculate remaining seconds on the 24-hour operator verification timer.
     */
    public function getRemainingVerificationSecondsAttribute(): int
    {
        if ($this->status !== 'Pending' || !$this->verification_deadline) {
            return 0;
        }
        return max(0, Carbon::now()->diffInSeconds($this->verification_deadline, false));
    }

    public function homestay()
    {
        return $this->belongsTo(Homestay::class);
    }

    public function tourist()
    {
        return $this->belongsTo(User::class, 'tourist_id');
    }
}

