{{-- ==========================================================================
     Page 3 Blade View: Internal Login (Operators & BPE PERDA Officers)
     (resources/views/pages/login.blade.php)
     ========================================================================== --}}
@extends('layouts.app')

@section('title', 'Internal Portal Login — e-Homestay PERDA')

@push('styles')
  <link rel="stylesheet" href="{{ asset('css/login.css') }}">
@endpush

@section('content')
  <div class="login-page-wrapper">
    <div class="login-shell-card">
      <div class="row g-0">
        <div class="col-lg-5 login-brand-panel">
          <div>
            <h1 class="h3 font-heading mb-3" style="color: var(--cream);">Internal Portal for Operators &amp; BPE PERDA Officers</h1>
            <p class="small" style="color: var(--cream);">
              Admin login only accepts registered and verified official PERDA administrator emails (<code>@perda.gov.my</code>).
            </p>
          </div>
        </div>
        <div class="col-lg-7 login-form-panel">
          <h2 class="h4 font-heading mb-3">Sign In</h2>
          <div id="loginErrorBanner" class="login-error-banner" role="alert">
            <span id="loginErrorBannerText"></span>
          </div>
          <form id="internalLoginForm" action="{{ route('login.authenticate') }}" method="POST" novalidate>
            @csrf
            <div class="mb-3">
              <label for="loginEmail" class="form-label">Email Address *</label>
              <input type="email" id="loginEmail" name="email" class="form-control" required>
            </div>
            <div class="mb-3">
              <div class="d-flex justify-content-between">
                <label for="loginPassword" class="form-label">Password *</label>
                <a href="#forgotPasswordModal" data-bs-toggle="modal" class="small">Forgot password?</a>
              </div>
              <div class="password-input-group">
                <input type="password" id="loginPassword" name="password" class="form-control" required>
                <button type="button" id="togglePasswordBtn" class="password-toggle-btn" aria-label="Show password">
                  <i class="fa-solid fa-eye"></i>
                </button>
              </div>
            </div>
            <button type="submit" class="btn btn-cta w-100">Sign In</button>
          </form>
        </div>
      </div>
    </div>
  </div>
@endsection

@push('scripts')
  <script src="{{ asset('js/validation.js') }}"></script>
@endpush

