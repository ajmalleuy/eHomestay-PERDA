<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * ============================================================================
 * AuthController (app/Http/Controllers/AuthController.php)
 * Handles Page 3: Unified Internal Login for Homestay Operators and
 * BPE PERDA Officers (Admin).
 * Enforces strict rule: Admin login ONLY accepts registered and verified
 * official administrator emails (@perda.gov.my).
 * ============================================================================
 */
class AuthController extends Controller
{
    /**
     * Display the unified Operator & BPE PERDA Officer login page.
     */
    public function showLogin()
    {
        return view('pages.login');
    }

    /**
     * Authenticate Operator or BPE PERDA Officer (Admin).
     */
    public function authenticate(Request $request)
    {
        $credentials = $request->validate([
            'email'      => ['required', 'email'],
            'password'   => ['required', 'string', 'min:6'],
            'login_role' => ['required', 'in:operator,officer'],
        ]);

        $email = strtolower(trim($credentials['email']));
        $user = User::where('email', $email)->first();

        // 1. Strict Verification for BPE PERDA Officer (Admin) Login
        if ($credentials['login_role'] === 'officer') {
            if (!str_ends_with($email, '@perda.gov.my')) {
                return back()->withInput()->withErrors([
                    'email' => 'Access Denied: Admin login only accepts registered and verified official PERDA administrator emails (@perda.gov.my).',
                ]);
            }

            if (!$user || !$user->isVerifiedPerdaOfficer()) {
                return back()->withInput()->withErrors([
                    'email' => 'Unverified Administrator Email: This account is not registered or verified in the official BPE PERDA Officer directory.',
                ]);
            }
        }

        // 2. Check Operator Role
        if ($credentials['login_role'] === 'operator' && (!$user || $user->role !== 'operator')) {
            return back()->withInput()->withErrors([
                'email' => 'No registered PERDA Homestay Operator account was found for this email address.',
            ]);
        }

        // 3. Attempt Standard Laravel Password Authentication
        if (Auth::attempt(['email' => $email, 'password' => $credentials['password']], $request->boolean('remember'))) {
            $request->session()->regenerate();
            return redirect()->route('dashboard', ['role' => $user->role]);
        }

        return back()->withInput()->withErrors([
            'password' => 'Invalid password provided. Please check your credentials and try again.',
        ]);
    }

    /**
     * Sign out from the internal portal.
     */
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}

