{{-- ==========================================================================
     Page 5 Blade View: Operator Verification & 24-Hour SLA Approval
     (resources/views/pages/verification.blade.php)
     ========================================================================== --}}
@extends('layouts.portal')

@section('title', 'Booking Verification & Approval — e-Homestay PERDA')

@push('styles')
  <link rel="stylesheet" href="{{ asset('css/verification.css') }}">
@endpush

@section('topbar')
  <header class="portal-topbar">
    <div class="d-flex align-items-center gap-2">
      <button type="button" id="sidebarToggleBtn" class="btn btn-olive d-lg-none px-3" aria-label="Open sidebar">
        <i class="fa-solid fa-bars"></i>
      </button>
      <h1 class="h5 font-heading mb-0">Payment Verification &amp; Approval (24-Hour SLA)</h1>
    </div>
    <div class="position-relative">
      <button type="button" id="notifBellBtn" class="notif-bell-btn" aria-label="Notifications">
        <i class="fa-solid fa-bell"></i>
        <span id="notifCountBadge" class="notif-count-dot">3</span>
      </button>
    </div>
  </header>
@endsection

@section('content')
  <div class="row g-4">
    <div class="col-xl-7">
      <div class="perda-card p-4">
        <div class="d-flex gap-2 mb-3">
          <select id="verificationStatusFilter" class="form-select">
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <input type="search" id="verificationSearchInput" class="form-control" placeholder="Search booking...">
        </div>
        <div class="table-responsive">
          <table class="table align-middle table-mobile-cards">
            <thead>
              <tr>
                <th>Ref No.</th><th>Guest</th><th>Homestay</th><th>Dates</th><th>Amount</th><th>24h Timer</th><th>Status</th>
              </tr>
            </thead>
            <tbody id="verificationTableBody"></tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="col-xl-5">
      <div class="perda-card p-4">
        <h2 id="detailVerifyRef" class="h4 font-heading">PERDA-2026-84920</h2>
        <div id="detailCountdownTimerText" class="fw-bold mb-3" style="color: var(--burnt-orange);"></div>
        <div class="receipt-preview-frame mb-3">
          <img src="{{ asset('images/sample-receipt.svg') }}" alt="Payment Receipt Preview">
        </div>
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-olive flex-grow-1" onclick="openDecisionModal('Approved')">Approve</button>
          <button type="button" class="btn btn-cta flex-grow-1" onclick="openDecisionModal('Rejected')">Reject</button>
        </div>
      </div>
    </div>
  </div>
@endsection

@push('scripts')
  <script src="{{ asset('js/validation.js') }}"></script>
@endpush

