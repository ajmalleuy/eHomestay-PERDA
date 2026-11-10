<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * ============================================================================
 * BlockedDate Model (app/Models/BlockedDate.php)
 * Used by the Operator "Block Calendar" tool to block dates for maintenance
 * or personal use, preventing double bookings.
 * ============================================================================
 */
class BlockedDate extends Model
{
    use HasFactory;

    protected $fillable = [
        'homestay_id',
        'blocked_date',
        'reason', // e.g., 'Scheduled Maintenance', 'Personal Use'
    ];

    protected $casts = [
        'blocked_date' => 'date',
    ];

    public function homestay()
    {
        return $this->belongsTo(Homestay::class);
    }
}

