<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;

/**
 * ============================================================================
 * VerificationController (app/Http/Controllers/VerificationController.php)
 * Handles Page 5: Operator Booking Verification & Approval Table,
 * Receipt Preview, 24-Hour SLA Countdown Timer, and Approve/Reject actions.
 * ============================================================================
 */
class VerificationController extends Controller
{
    /**
     * Display the incoming bookings table with status filter and selected booking detail.
     */
    public function index(Request $request)
    {
        $query = Booking::with('homestay')->latest();

        if ($request->filled('status') && $request->status !== 'ALL') {
            $query->where('status', $request->status);
        }

        $bookings = $query->get();
        $selectedBooking = $request->filled('ref')
            ? Booking::with('homestay')->where('reference_number', $request->ref)->first()
            : $bookings->first();

        return view('pages.verification', compact('bookings', 'selectedBooking'));
    }

    /**
     * Approve or Reject a booking after inspecting its uploaded payment receipt.
     */
    public function updateStatus(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'status'         => ['required', 'in:Approved,Rejected'],
            'operator_notes' => ['nullable', 'string', 'max:500'],
        ]);

        $booking->update([
            'status'         => $validated['status'],
            'operator_notes' => $validated['operator_notes'] ?? null,
            'verified_at'    => now(),
        ]);

        return redirect()
            ->route('verification.index', ['ref' => $booking->reference_number])
            ->with('success', "Booking {$booking->reference_number} has been {$validated['status']}.");
    }
}

