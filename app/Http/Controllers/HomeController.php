<?php

namespace App\Http\Controllers;

use App\Models\Homestay;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

/**
 * ============================================================================
 * HomeController (app/Http/Controllers/HomeController.php)
 * Handles Page 1: Tourist Landing & Search, Homestay Details View,
 * Real-Time Availability Calendar, and Tourist Registration.
 * ============================================================================
 */
class HomeController extends Controller
{
    /**
     * Display the Landing & Search page with filtered homestays.
     */
    public function index(Request $request)
    {
        $query = Homestay::with('blockedDates')->where('is_active', true);

        // Filter by PERDA District
        if ($request->filled('district') && $request->district !== 'ALL') {
            $query->where('district', 'like', '%' . $request->district . '%');
        }

        // Filter by Guest Capacity
        if ($request->filled('guests')) {
            $query->where('max_guests', '>=', (int) $request->guests);
        }

        $homestays = $query->orderBy('price_per_night', 'asc')->get();
        $featuredHomestay = $homestays->first();

        return view('pages.landing', compact('homestays', 'featuredHomestay'));
    }

    /**
     * Register a new Tourist account with the promotional email opt-in checkbox:
     * "I agree to receive promotional emails from PERDA"
     */
    public function registerTourist(Request $request)
    {
        $validated = $request->validate([
            'name'               => ['required', 'string', 'min:3', 'max:120'],
            'email'              => ['required', 'email', 'max:150', 'unique:users,email'],
            'phone'              => ['required', 'string', 'min:9', 'max:20'],
            'password'           => ['required', 'string', 'min:8', 'confirmed'],
            'promo_email_opt_in' => ['nullable', 'boolean'],
        ]);

        $tourist = User::create([
            'name'               => $validated['name'],
            'email'              => $validated['email'],
            'phone'              => $validated['phone'],
            'password'           => Hash::make($validated['password']),
            'role'               => 'tourist',
            'promo_email_opt_in' => $request->boolean('promo_email_opt_in'),
            'is_verified_admin'  => false,
        ]);

        Auth::login($tourist);

        return redirect()
            ->route('landing')
            ->with('success', 'Welcome to e-Homestay PERDA! Your tourist account has been created.');
    }
}

