{{-- ==========================================================================
     Page 1 Blade View: Landing & Search (resources/views/pages/landing.blade.php)
     Includes Hero Quick Search, Homestay Cards, Details + Availability Calendar,
     and Tourist Registration Form with Promotional Email Opt-In.
     ========================================================================== --}}
@extends('layouts.app')

@section('title', 'e-Homestay PERDA — Official Rural Homestay (Inap Desa) Booking Platform')

@push('styles')
  <link rel="stylesheet" href="{{ asset('css/landing.css') }}">
@endpush

@section('content')
  <!-- 1. HERO SECTION & QUICK SEARCH BAR -->
  <section class="hero-section text-center">
    <div class="container">
      <div class="hero-badge">
        <i class="fa-solid fa-leaf" style="color: var(--sand);"></i>
        Official Penang Regional Development Authority (PERDA) Initiative
      </div>
      <h1 class="hero-title">Discover Authentic Malaysian Village Hospitality</h1>
      <p class="hero-subtitle">
        Search, check real-time availability, and book verified PERDA Homestay homestays across scenic paddy fields, orchards, and tranquil islands in Penang.
      </p>

      <div class="quick-search-card text-start mx-auto" style="max-width: 1080px;">
        <form id="quickSearchForm" action="{{ route('landing') }}" method="GET" novalidate>
          <div class="row g-3 align-items-end">
            <div class="col-12 col-md-6 col-lg-3">
              <label for="searchDistrict" class="form-label">
                <i class="fa-solid fa-map-location-dot me-1" style="color: var(--olive);"></i> PERDA District
              </label>
              <select id="searchDistrict" name="district" class="form-select">
                <option value="ALL">All PERDA Districts (Penang)</option>
                <option value="Kepala Batas">Seberang Perai Utara (Kepala Batas)</option>
                <option value="Tasek Gelugor">Seberang Perai Utara (Tasek Gelugor)</option>
                <option value="Kubang Semang">Seberang Perai Tengah (Kubang Semang)</option>
                <option value="Balik Pulau">Barat Daya (Balik Pulau)</option>
                <option value="Nibong Tebal">Seberang Perai Selatan (Nibong Tebal)</option>
                <option value="Pulau Aman">Seberang Perai Selatan (Pulau Aman)</option>
              </select>
            </div>
            <div class="col-6 col-md-3 col-lg-2">
              <label for="searchCheckIn" class="form-label">Check-In Date</label>
              <input type="date" id="searchCheckIn" name="check_in" class="form-control" value="2026-11-14" required>
            </div>
            <div class="col-6 col-md-3 col-lg-2">
              <label for="searchCheckOut" class="form-label">Check-Out Date</label>
              <input type="date" id="searchCheckOut" name="check_out" class="form-control" value="2026-11-16" required>
            </div>
            <div class="col-12 col-md-6 col-lg-2">
              <label for="searchGuests" class="form-label">Guests</label>
              <select id="searchGuests" name="guests" class="form-select">
                <option value="2">2 Guests</option>
                <option value="4" selected>4 Guests</option>
                <option value="6">6 Guests</option>
                <option value="8">8 Guests</option>
              </select>
            </div>
            <div class="col-12 col-md-6 col-lg-3">
              <!-- Search Button in Burnt Orange (#BC6C25) -->
              <button type="submit" class="btn btn-cta w-100">
                <i class="fa-solid fa-magnifying-glass"></i> Search Homestays
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </section>

  <!-- 2. HOMESTAY SEARCH RESULTS -->
  <section id="homestaysSection" class="py-5">
    <div class="container">
      <div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
        <div>
          <span class="badge-pill badge-pending mb-2"><i class="fa-solid fa-seedling"></i> Curated Rural Retreats</span>
          <h2 class="mb-1">Featured PERDA Homestay Homestays</h2>
          <p id="searchResultCount" class="mb-0" style="color: var(--olive);">Showing all PERDA Homestays</p>
        </div>
        <button type="button" id="resetSearchBtn" class="btn btn-outline-olive">
          <i class="fa-solid fa-rotate-left"></i> Reset Filters
        </button>
      </div>
      <div id="homestayCardsGrid" class="homestay-grid"></div>
    </div>
  </section>

  <!-- 3. HOMESTAY DETAILS VIEW & AVAILABILITY CALENDAR -->
  <section id="homestayDetailsSection" class="py-5" style="background-color: rgba(221, 161, 94, 0.14); border-top: 2px solid var(--sand);">
    <div class="container">
      <div class="details-showcase-card">
        <div class="row g-4">
          <div class="col-lg-7">
            <img id="detailMainImage" src="{{ asset('images/homestay-1.svg') }}" alt="Selected Homestay" class="gallery-main-img mb-3">
            <div id="detailGalleryThumbs" class="row g-2 mb-4"></div>
            <span id="detailHomestayDistrict" class="badge-pill badge-pending mb-2">Seberang Perai Utara (Kepala Batas)</span>
            <h3 id="detailHomestayName" class="font-heading mb-1">Inap Desa Kampung Agung Harmoni</h3>
            <p id="detailHomestayDesc" class="mb-3"></p>
            <div id="detailFacilitiesList" class="d-flex flex-wrap gap-2"></div>
          </div>
          <div class="col-lg-5">
            <div class="availability-calendar-box h-100 d-flex flex-column justify-content-between">
              <div>
                <h4 class="h5 font-heading mb-3">Real-Time Availability Calendar</h4>
                <div class="calendar-grid-header">
                  <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                </div>
                <div id="touristCalendarDays" class="calendar-days-grid mb-3"></div>
              </div>
              <div class="p-3 rounded-4" style="background-color: var(--white); border: 1.5px solid var(--sand);">
                <div id="selectedDatesSummaryText" class="fw-bold small my-1"></div>
                <div class="d-flex justify-content-between align-items-center pt-2 mt-2 border-top">
                  <div id="selectedDatesTotalPrice" class="h4 font-heading mb-0" style="color: var(--burnt-orange);">RM 440.00</div>
                  <button type="button" id="proceedToBookBtn" class="btn btn-cta">Book Now</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- 4. TOURIST REGISTRATION FORM WITH OPT-IN CHECKBOX -->
  <section id="registerSection" class="registration-section">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="perda-card p-4 p-md-5">
            <h2 class="font-heading text-center mb-3">Create Your Tourist Account</h2>
            <form id="touristRegisterForm" action="{{ route('tourist.register') }}" method="POST" novalidate>
              @csrf
              <div class="row g-3">
                <div class="col-md-6">
                  <label for="regFullName" class="form-label">Full Name *</label>
                  <input type="text" id="regFullName" name="name" class="form-control" required>
                  <div id="regFullNameErr" class="invalid-feedback-custom"></div>
                </div>
                <div class="col-md-6">
                  <label for="regEmail" class="form-label">Email Address *</label>
                  <input type="email" id="regEmail" name="email" class="form-control" required>
                  <div id="regEmailErr" class="invalid-feedback-custom"></div>
                </div>
                <div class="col-md-6">
                  <label for="regPhone" class="form-label">Phone Number *</label>
                  <input type="tel" id="regPhone" name="phone" class="form-control" required>
                  <div id="regPhoneErr" class="invalid-feedback-custom"></div>
                </div>
                <div class="col-md-3">
                  <label for="regPassword" class="form-label">Password *</label>
                  <input type="password" id="regPassword" name="password" class="form-control" required>
                  <div id="regPasswordErr" class="invalid-feedback-custom"></div>
                </div>
                <div class="col-md-3">
                  <label for="regConfirmPassword" class="form-label">Confirm Password *</label>
                  <input type="password" id="regConfirmPassword" name="password_confirmation" class="form-control" required>
                  <div id="regConfirmPasswordErr" class="invalid-feedback-custom"></div>
                </div>
                <div class="col-12">
                  <div class="form-check">
                    <input type="checkbox" id="regPromoOptIn" name="promo_email_opt_in" value="1" class="form-check-input" checked>
                    <label for="regPromoOptIn" class="form-check-label fw-semibold">
                      I agree to receive promotional emails from PERDA
                    </label>
                  </div>
                </div>
                <div class="col-12">
                  <button type="submit" class="btn btn-olive px-4">Register Tourist Account</button>
                </div>
              </div>
              <div id="regSuccessBanner"></div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
@endsection

@push('scripts')
  <script src="{{ asset('js/calendar.js') }}"></script>
  <script src="{{ asset('js/validation.js') }}"></script>
@endpush

