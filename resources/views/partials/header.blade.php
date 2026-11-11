{{-- ==========================================================================
     Shared Public Navbar Partial (resources/views/partials/header.blade.php)
     Dark Green (#283618) Navbar with Cream (#FEFAE0) Text & Sand Accents
     ========================================================================== --}}
<header>
  <nav class="navbar navbar-expand-lg perda-navbar" aria-label="Main Navigation">
    <div class="container">
      <a class="navbar-brand d-flex align-items-center" href="{{ route('landing') }}">
        <img src="{{ asset('images/logo.svg') }}" alt="e-Homestay PERDA Homestay Logo">
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#publicNavbarCollapse" aria-controls="publicNavbarCollapse" aria-expanded="false" aria-label="Toggle navigation menu">
        <i class="fa-solid fa-bars"></i>
      </button>
      <div class="collapse navbar-collapse" id="publicNavbarCollapse">
        <ul class="navbar-nav ms-auto align-items-lg-center gap-1 mt-3 mt-lg-0">
          <li class="nav-item">
            <a class="nav-link {{ request()->routeIs('landing') ? 'active' : '' }}" href="{{ route('landing') }}">
              <i class="fa-solid fa-house"></i> Home
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="{{ route('landing') }}#homestaysSection">
              <i class="fa-solid fa-tree-city"></i> Homestays
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link {{ request()->routeIs('booking.*') ? 'active' : '' }}" href="{{ route('booking.create') }}#trackingSection">
              <i class="fa-solid fa-magnifying-glass-location"></i> Track Booking
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="{{ route('landing') }}#registerSection">
              <i class="fa-solid fa-user-plus"></i> Register
            </a>
          </li>
          <li class="nav-item ms-lg-2">
            <a class="btn btn-sand" href="{{ route('login') }}">
              <i class="fa-solid fa-right-to-bracket"></i> Login / Portal
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</header>

