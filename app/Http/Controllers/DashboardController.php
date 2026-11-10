<?php

namespace App\Http\Controllers;

use App\Models\BlockedDate;
use App\Models\Booking;
use App\Models\Homestay;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

/**
 * ============================================================================
 * DashboardController (app/Http/Controllers/DashboardController.php)
 * Handles Page 4: Officer Dashboard (KPI cards + booking trend chart) and
 * Operator Dashboard (unit CRUD management + Block Calendar tool).
 * ============================================================================
 */
class DashboardController extends Controller
{
    /**
     * Display the Officer / Operator Dashboard.
     */
    public function index(Request $request)
    {
        // Officer KPI Summary Metrics
        $stats = [
            'total_bookings'        => Booking::count(),
            'total_users'           => User::count(),
            'active_homestays'      => Homestay::where('is_active', true)->count(),
            'pending_verifications' => Booking::where('status', 'Pending')->count(),
        ];

        $homestays = Homestay::with('blockedDates')->latest()->get();
        $upcomingStays = Booking::with('homestay')
            ->where('status', 'Approved')
            ->where('check_in', '>=', now()->toDateString())
            ->orderBy('check_in', 'asc')
            ->take(5)
            ->get();

        return view('pages.dashboard', compact('stats', 'homestays', 'upcomingStays'));
    }

    /**
     * Operator: Update ONLY their own assigned Homestay Unit (1 Operator = 1 Homestay).
     */
    public function saveHomestay(Request $request)
    {
        $validated = $request->validate([
            'homestay_id'     => ['required', 'exists:homestays,id'],
            'name'            => ['required', 'string', 'min:4', 'max:150'],
            'district'        => ['required', 'string', 'max:100'],
            'max_guests'      => ['required', 'integer', 'min:1', 'max:25'],
            'price_per_night' => ['required', 'numeric', 'min:50', 'max:2500'],
            'cover_image'     => ['required', 'string'],
            'description'     => ['required', 'string', 'min:15'],
        ]);

        $homestay = Homestay::findOrFail($validated['homestay_id']);

        // Enforce 1-Operator-1-Homestay Ownership Policy
        abort_if(
            Auth::check() && $homestay->operator_id !== Auth::id(),
            403,
            'Access Restricted: You can only edit your own assigned homestay unit.'
        );

        $homestay->update([
            'name'             => $validated['name'],
            'slug'             => Str::slug($validated['name']),
            'district'         => $validated['district'],
            'location_address' => $validated['district'] . ', Pulau Pinang',
            'max_guests'       => $validated['max_guests'],
            'price_per_night'  => $validated['price_per_night'],
            'cover_image'      => $validated['cover_image'],
            'description'      => $validated['description'],
        ]);

        return redirect()
            ->route('dashboard', ['role' => 'operator'])
            ->with('success', 'Your assigned homestay unit has been updated.');
    }

    /**
     * Operator: Toggle a Blocked Date on ONLY their own homestay's Block Calendar.
     */
    public function toggleBlockedDate(Request $request)
    {
        $validated = $request->validate([
            'homestay_id'  => ['required', 'exists:homestays,id'],
            'blocked_date' => ['required', 'date'],
            'reason'       => ['required', 'string', 'max:120'],
        ]);

        $homestay = Homestay::findOrFail($validated['homestay_id']);

        abort_if(
            Auth::check() && $homestay->operator_id !== Auth::id(),
            403,
            'Access Restricted: You can only block dates on your own homestay unit.'
        );

        $existing = BlockedDate::where('homestay_id', $validated['homestay_id'])
            ->where('blocked_date', $validated['blocked_date'])
            ->first();

        if ($existing) {
            $existing->delete();
            $message = 'Date unblocked and re-opened for tourist bookings.';
        } else {
            BlockedDate::create($validated);
            $message = 'Date blocked successfully to prevent double bookings.';
        }

        return back()->with('success', $message);
    }
}

