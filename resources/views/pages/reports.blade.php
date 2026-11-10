{{-- ==========================================================================
     Page 6 Blade View: BPE PERDA Officer Reports & Analytics
     (resources/views/pages/reports.blade.php)
     ========================================================================== --}}
@extends('layouts.portal')

@section('title', 'Officer Reports & Analytics — e-Homestay PERDA')

@push('styles')
  <link rel="stylesheet" href="{{ asset('css/reports.css') }}">
@endpush

@section('topbar')
  <header class="portal-topbar">
    <div class="d-flex align-items-center gap-2">
      <button type="button" id="sidebarToggleBtn" class="btn btn-olive d-lg-none px-3" aria-label="Open sidebar">
        <i class="fa-solid fa-bars"></i>
      </button>
      <h1 class="h5 font-heading mb-0">BPE PERDA Officer Reports &amp; Analytics</h1>
    </div>
    <div class="d-flex gap-2 no-print">
      <button type="button" id="exportPdfBtn" class="btn btn-cta btn-sm">
        <i class="fa-solid fa-file-pdf"></i> Export PDF
      </button>
      <a href="{{ route('reports.export.excel') }}" id="exportExcelBtn" class="btn btn-olive btn-sm">
        <i class="fa-solid fa-file-excel"></i> Export Excel
      </a>
    </div>
  </header>
@endsection

@section('content')
  <div class="report-filter-card mb-4 no-print">
    <form id="reportFilterForm" class="row g-3 align-items-end">
      <div class="col-md-3">
        <label for="reportStartDate" class="form-label small">Start Date</label>
        <input type="date" id="reportStartDate" class="form-control" value="2026-06-01">
      </div>
      <div class="col-md-3">
        <label for="reportEndDate" class="form-label small">End Date</label>
        <input type="date" id="reportEndDate" class="form-control" value="2026-11-30">
      </div>
      <div class="col-md-3">
        <label for="reportDistrictFilter" class="form-label small">District</label>
        <select id="reportDistrictFilter" class="form-select">
          <option value="ALL">All PERDA Districts</option>
          <option value="Kepala Batas">Kepala Batas</option>
          <option value="Kubang Semang">Kubang Semang</option>
          <option value="Balik Pulau">Balik Pulau</option>
          <option value="Nibong Tebal">Nibong Tebal</option>
          <option value="Pulau Aman">Pulau Aman</option>
        </select>
      </div>
      <div class="col-md-3">
        <button type="submit" class="btn btn-cta w-100">Apply Filter</button>
      </div>
    </form>
  </div>

  <div class="row g-4 mb-4">
    <div class="col-lg-7">
      <div class="perda-card p-4">
        <h2 class="h5 font-heading mb-3">Monthly Rental Collection (Bar Chart)</h2>
        <div class="chart-canvas-wrapper"><canvas id="reportsBarChartCanvas"></canvas></div>
      </div>
    </div>
    <div class="col-lg-5">
      <div class="perda-card p-4">
        <h2 class="h5 font-heading mb-3">Bookings by District (Pie Chart)</h2>
        <div class="chart-canvas-wrapper"><canvas id="reportsPieChartCanvas"></canvas></div>
      </div>
    </div>
  </div>

  <div class="perda-card p-4">
    <div class="table-responsive">
      <table class="table align-middle table-mobile-cards">
        <thead>
          <tr>
            <th>Period</th><th>Homestay Unit</th><th>District</th><th>Bookings</th><th>Tourist Volume</th><th>Occupancy</th><th>Collection (RM)</th>
          </tr>
        </thead>
        <tbody id="reportDataTableBody"></tbody>
      </table>
    </div>
  </div>
@endsection

@push('scripts')
  <script src="{{ asset('js/charts.js') }}"></script>
@endpush

