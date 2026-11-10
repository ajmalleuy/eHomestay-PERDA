<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Homestay;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

/**
 * ============================================================================
 * BookingController (app/Http/Controllers/BookingController.php)
 * Handles Page 2: Tourist Booking Form, Payment Proof Upload Validation
 * (JPG/PNG/PDF only, max 5MB), Booking Reference Generation, and Status Tracking.
 * ============================================================================
 */
class BookingController extends Controller
{
    /**
     * Show the Booking Form & Booking Status Tracking page.
     */
    public function create(Request $request)
    {
        $homestays = Homestay::where('is_active', true)->get();
        $selectedHomestay = $request->filled('homestay_id')
            ? Homestay::find($request->homestay_id)
            : $homestays->first();

        $trackedBooking = null;
        if ($request->filled('reference_number')) {
            $trackedBooking = Booking::with('homestay')
                ->where('reference_number', strtoupper(trim($request->reference_number)))
                ->first();
        }

        return view('pages.booking', compact('homestays', 'selectedHomestay', 'trackedBooking'));
    }

    /**
     * Store a new Tourist Booking and validate the uploaded Payment Proof
     * (Strictly JPG, PNG, or PDF only, maximum 5120 KB / 5MB).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'homestay_id'      => ['required', 'exists:homestays,id'],
            'check_in'         => ['required', 'date', 'after_or_equal:today'],
            'check_out'        => ['required', 'date', 'after:check_in'],
            'guests_count'     => ['required', 'integer', 'min:1'],
            'guest_full_name'  => ['required', 'string', 'min:3', 'max:120'],
            'guest_phone'      => ['required', 'string', 'min:9', 'max:20'],
            'guest_email'      => ['required', 'email', 'max:150'],
            'special_requests' => ['nullable', 'string', 'max:1000'],
            'payment_proof'    => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:5120', // 5120 KB = 5 MB maximum
            ],
        ], [
            'payment_proof.mimes' => 'Only JPG, PNG, and PDF files are accepted for payment proof.',
            'payment_proof.max'   => 'File size exceeds the 5.00 MB maximum limit! Please upload a smaller receipt.',
        ]);

        $homestay = Homestay::findOrFail($validated['homestay_id']);

        if (!$homestay->isAvailableForDates($validated['check_in'], $validated['check_out'])) {
            return back()
                ->withInput()
                ->withErrors(['check_in' => 'Selected dates are unavailable or blocked for this homestay.']);
        }

        $nights = max(1, Carbon::parse($validated['check_in'])->diffInDays(Carbon::parse($validated['check_out'])));
        $totalPrice = $nights * $homestay->price_per_night;

        $file = $request->file('payment_proof');
        $storedPath = $file->store('payment_receipts', 'public');

        $booking = Booking::create([
            'reference_number'      => Booking::generateReferenceNumber(),
            'homestay_id'           => $homestay->id,
            'tourist_id'            => Auth::id(),
            'guest_full_name'       => $validated['guest_full_name'],
            'guest_phone'           => $validated['guest_phone'],
            'guest_email'           => $validated['guest_email'],
            'check_in'              => $validated['check_in'],
            'check_out'             => $validated['check_out'],
            'nights_count'          => $nights,
            'guests_count'          => $validated['guests_count'],
            'total_price'           => $totalPrice,
            'special_requests'      => $validated['special_requests'] ?? null,
            'payment_proof_path'    => $storedPath,
            'payment_proof_mime'    => $file->getClientMimeType(),
            'payment_proof_size'    => $file->getSize(),
            'status'                => 'Pending',
            'verification_deadline' => Carbon::now()->addHours(24), // 24-hour operator SLA timer
        ]);

        return redirect()
            ->route('booking.create', ['reference_number' => $booking->reference_number])
            ->with('confirmed_booking', $booking);
    }
}

