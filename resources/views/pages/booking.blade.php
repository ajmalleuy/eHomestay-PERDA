{{-- ==========================================================================
     Page 2 Blade View: Booking Form & Status Tracking
     (resources/views/pages/booking.blade.php)
     ========================================================================== --}}
@extends('layouts.app')

@section('title', 'Book Homestay & Track Status — e-Homestay PERDA')

@push('styles')
  <link rel="stylesheet" href="{{ asset('css/booking.css') }}">
@endpush

@section('content')
  <section class="booking-header-banner">
    <div class="container">
      <h1 class="font-heading mb-1" style="color: var(--cream);">Complete Your Homestay Booking</h1>
      <p class="mb-0" style="color: var(--cream);">Upload your payment proof (JPG/PNG/PDF, max 5MB) and track your reservation status.</p>
    </div>
  </section>

  <section class="py-5">
    <div class="container">
      <div id="bookingFormContainer" class="row g-4">
        <div class="col-lg-7">
          <div class="perda-card p-4 p-md-5">
            <form id="touristBookingForm" action="{{ route('booking.store') }}" method="POST" enctype="multipart/form-data" novalidate>
              @csrf
              <div class="row g-3">
                <div class="col-12">
                  <label for="bookingHomestaySelect" class="form-label">Homestay Unit *</label>
                  <select id="bookingHomestaySelect" name="homestay_id" class="form-select"></select>
                </div>
                <div class="col-sm-4">
                  <label for="bookingCheckIn" class="form-label">Check-In *</label>
                  <input type="date" id="bookingCheckIn" name="check_in" class="form-control" value="2026-11-14" required>
                </div>
                <div class="col-sm-4">
                  <label for="bookingCheckOut" class="form-label">Check-Out *</label>
                  <input type="date" id="bookingCheckOut" name="check_out" class="form-control" value="2026-11-16" required>
                  <div id="bookingDatesErr" class="invalid-feedback-custom"></div>
                </div>
                <div class="col-sm-4">
                  <label for="bookingGuests" class="form-label">Guests *</label>
                  <input type="number" id="bookingGuests" name="guests_count" class="form-control" value="4" min="1" required>
                  <div id="bookingGuestsErr" class="invalid-feedback-custom"></div>
                </div>
                <div class="col-md-6">
                  <label for="touristFullName" class="form-label">Full Name *</label>
                  <input type="text" id="touristFullName" name="guest_full_name" class="form-control" required>
                  <div id="touristFullNameErr" class="invalid-feedback-custom"></div>
                </div>
                <div class="col-md-6">
                  <label for="touristPhone" class="form-label">Phone Number *</label>
                  <input type="tel" id="touristPhone" name="guest_phone" class="form-control" required>
                  <div id="touristPhoneErr" class="invalid-feedback-custom"></div>
                </div>
                <div class="col-12">
                  <label for="touristEmail" class="form-label">Email Address *</label>
                  <input type="email" id="touristEmail" name="guest_email" class="form-control" required>
                  <div id="touristEmailErr" class="invalid-feedback-custom"></div>
                </div>
                <div class="col-12">
                  <label for="touristSpecialRequests" class="form-label">Special Requests</label>
                  <textarea id="touristSpecialRequests" name="special_requests" class="form-control" rows="2"></textarea>
                </div>
                <div class="col-12">
                  <label for="paymentProofInput" class="form-label">Payment Proof Upload (JPG/PNG/PDF only, max 5MB) *</label>
                  <div id="paymentUploadZone" class="payment-upload-zone" tabindex="0">
                    <input type="file" id="paymentProofInput" name="payment_proof" class="d-none" accept=".jpg,.jpeg,.png,.pdf">
                    <i class="fa-solid fa-cloud-arrow-up fa-2x mb-2" style="color: var(--olive);"></i>
                    <p class="mb-0 fw-semibold">Click or Drag Receipt File Here (Max 5.00 MB)</p>
                  </div>
                  <div id="paymentFileErrorBox" class="file-error-alert" role="alert">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <span id="paymentFileErrorText"></span>
                  </div>
                  <div id="paymentUploadPreviewCard" class="upload-preview-card">
                    <span id="previewFileName" class="fw-bold"></span>
                    <span id="previewFileSize" class="small ms-2"></span>
                  </div>
                </div>
                <div class="col-12 mt-3">
                  <button type="submit" class="btn btn-cta w-100">Submit Booking</button>
                </div>
              </div>
            </form>
          </div>
        </div>
        <div class="col-lg-5">
          <aside class="booking-summary-card">
            <h3 class="h5 font-heading mb-3">Booking Summary</h3>
            <h4 id="summaryHomestayName" class="h6 font-heading">Inap Desa Kampung Agung Harmoni</h4>
            <div class="summary-price-row"><span>Check-In</span><strong id="summaryCheckInDate">2026-11-14</strong></div>
            <div class="summary-price-row"><span>Check-Out</span><strong id="summaryCheckOutDate">2026-11-16</strong></div>
            <div class="summary-price-row"><span>Nights</span><strong id="summaryNightsCount">2 Night(s)</strong></div>
            <div class="summary-price-row"><span>Guests</span><strong id="summaryGuestsCount">4 Guest(s)</strong></div>
            <div class="summary-total-box">
              <span>Total Price</span>
              <strong id="summaryTotalPrice" class="h4 font-heading mb-0" style="color: var(--cream);">RM 440.00</strong>
            </div>
          </aside>
        </div>
      </div>

      <!-- Confirmation Screen -->
      <div id="bookingConfirmationScreen" class="confirmation-screen d-none my-4">
        <h2 class="font-heading">Booking Submitted!</h2>
        <div class="reference-code-pill"><span id="confirmedRefCode">PERDA-2026-84920</span></div>
      </div>
    </div>
  </section>

  <!-- Booking Status Tracking Section -->
  <section id="trackingSection" class="py-5">
    <div class="container">
      <div class="perda-card p-4">
        <h2 class="h4 font-heading mb-3">Track Booking Status by Reference Number</h2>
        <form id="bookingTrackForm" class="d-flex gap-2 mb-3" novalidate>
          <input type="text" id="trackRefInput" class="form-control" value="PERDA-2026-84920">
          <button type="submit" class="btn btn-cta">Track</button>
        </form>
        <div id="trackingResultContainer"></div>
      </div>
    </div>
  </section>
@endsection

@push('scripts')
  <script src="{{ asset('js/file-upload.js') }}"></script>
  <script src="{{ asset('js/validation.js') }}"></script>
@endpush

