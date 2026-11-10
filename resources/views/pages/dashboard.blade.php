{{-- ==========================================================================
     Page 4 Blade View: Officer & Operator Dashboard
     (resources/views/pages/dashboard.blade.php)
     ========================================================================== --}}
@extends('layouts.portal')

@section('title', 'Dashboard — e-Homestay PERDA')

@section('topbar')
  <header class="portal-topbar">
    <div class="d-flex align-items-center gap-2">
      <button type="button" id="sidebarToggleBtn" class="btn btn-olive d-lg-none px-3" aria-label="Open sidebar">
        <i class="fa-solid fa-bars"></i>
      </button>
      <h1 class="h5 font-heading mb-0">e-Homestay Management Dashboard</h1>
    </div>
    <div class="d-flex gap-2">
      <button type="button" id="switchToOfficerBtn" class="btn btn-olive btn-sm">Officer Dashboard</button>
      <button type="button" id="switchToOperatorBtn" class="btn btn-outline-olive btn-sm">Operator Dashboard</button>
    </div>
  </header>
@endsection

@section('content')
  <!-- Officer View -->
  <div id="officerDashboardView">
    <div class="row g-3 mb-4">
      <div class="col-sm-6 col-xl-3"><div class="kpi-card"><h6>Total Bookings</h6><h3>{{ $stats['total_bookings'] ?? 498 }}</h3></div></div>
      <div class="col-sm-6 col-xl-3"><div class="kpi-card"><h6>Registered Users</h6><h3>{{ $stats['total_users'] ?? 1842 }}</h3></div></div>
      <div class="col-sm-6 col-xl-3"><div class="kpi-card"><h6>Active Homestays</h6><h3>{{ $stats['active_homestays'] ?? 46 }}</h3></div></div>
      <div class="col-sm-6 col-xl-3"><div class="kpi-card kpi-accent"><h6>Pending Verifications</h6><h3>{{ $stats['pending_verifications'] ?? 3 }}</h3></div></div>
    </div>
    <div class="perda-card p-4">
      <h2 class="h5 font-heading mb-3">Booking Trend Chart</h2>
      <div class="chart-canvas-wrapper">
        <canvas id="officerTrendChartCanvas"></canvas>
      </div>
    </div>
  </div>

  <!-- Operator View: Unit Management & Block Calendar Tool -->
  <div id="operatorDashboardView" class="d-none">
    <div class="row g-4">
      <div class="col-lg-6">
        <div class="perda-card p-4">
          <h2 id="unitFormHeading" class="h5 font-heading mb-3">Add / Edit Homestay Unit</h2>
          <form id="operatorHomestayForm" action="{{ route('dashboard.homestay.save') }}" method="POST" novalidate>
            @csrf
            <input type="hidden" id="unitEditId" name="homestay_id">
            <div class="mb-3">
              <label for="unitNameInput" class="form-label">Homestay Name *</label>
              <input type="text" id="unitNameInput" name="name" class="form-control" required>
            </div>
            <div class="row g-2 mb-3">
              <div class="col-4">
                <label for="unitDistrictInput" class="form-label">District</label>
                <input type="text" id="unitDistrictInput" name="district" class="form-control" value="Kepala Batas">
              </div>
              <div class="col-4">
                <label for="unitCapacityInput" class="form-label">Max Guests</label>
                <input type="number" id="unitCapacityInput" name="max_guests" class="form-control" value="6">
              </div>
              <div class="col-4">
                <label for="unitPriceInput" class="form-label">Price (RM)</label>
                <input type="number" id="unitPriceInput" name="price_per_night" class="form-control" value="200">
              </div>
            </div>
            <div class="mb-3">
              <label for="unitDescInput" class="form-label">Description *</label>
              <textarea id="unitDescInput" name="description" class="form-control" rows="2"></textarea>
            </div>
            <button type="submit" class="btn btn-cta w-100">Save Homestay Unit</button>
          </form>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="perda-card p-4 h-100 d-flex flex-column justify-content-between">
          <div>
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <h2 class="h5 font-heading mb-0">
                <i class="fa-solid fa-calendar-xmark me-2" style="color: var(--burnt-orange);"></i>
                Block Calendar Tool (Prevent Double Bookings)
              </h2>
              <span id="blockedDatesCountBadge" class="badge-pill badge-pending">3 Blocked Date(s)</span>
            </div>
            <div class="row g-2 mb-3">
              <div class="col-sm-7">
                <label for="blockCalHomestaySelect" class="form-label small mb-1">Select Homestay Unit</label>
                <select id="blockCalHomestaySelect" class="form-select"></select>
              </div>
              <div class="col-sm-5">
                <label for="blockReasonSelect" class="form-label small mb-1">Block Reason</label>
                <select id="blockReasonSelect" class="form-select">
                  <option value="Scheduled Maintenance">Scheduled Maintenance</option>
                  <option value="Operator Personal / Family Use">Personal / Family Use</option>
                  <option value="Village Community Event">Village Community Event</option>
                </select>
              </div>
            </div>
            <div class="operator-calendar-shell mb-3">
              <div class="operator-cal-topbar">
                <button type="button" class="operator-cal-nav-btn" onclick="changeOperatorCalMonth(-1)" aria-label="Previous Month">
                  <i class="fa-solid fa-chevron-left"></i>
                </button>
                <div class="fw-bold d-flex align-items-center gap-2">
                  <i class="fa-regular fa-calendar-days" style="color: var(--sand);"></i>
                  <span id="operatorCalMonthTitle">November 2026</span>
                </div>
                <button type="button" class="operator-cal-nav-btn" onclick="changeOperatorCalMonth(1)" aria-label="Next Month">
                  <i class="fa-solid fa-chevron-right"></i>
                </button>
              </div>
              <div class="calendar-grid-header">
                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
              </div>
              <div id="operatorBlockCalendarGrid" class="calendar-days-grid"></div>
            </div>
          </div>
          <div class="p-3 rounded-4" style="background-color: var(--cream); border: 1px solid var(--sand);">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="small fw-bold">Active Blocked Dates:</span>
              <button type="button" class="btn btn-sand btn-sm py-0 px-2" style="min-height: 28px; font-size: 0.74rem;" onclick="clearAllUnitBlockedDates()">
                Unblock All
              </button>
            </div>
            <div id="operatorBlockedChipsList" class="d-flex flex-wrap gap-1"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
@endsection

@push('scripts')
  <script src="{{ asset('js/calendar.js') }}"></script>
  <script src="{{ asset('js/validation.js') }}"></script>
  <script src="{{ asset('js/charts.js') }}"></script>
@endpush

