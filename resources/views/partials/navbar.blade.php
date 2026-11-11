{{-- ==========================================================================
     Shared Public Navbar Component (resources/views/partials/navbar.blade.php)
     Single shared component used across all public pages (Home, Homestays,
     Track Booking, Login / Portal).
     Palette: Dark Green (#283618) bg, Cream (#FEFAE0) text, Olive (#606C38)
     active pill, Sand (#DDA15E) Login / Portal button.
     ========================================================================== --}}
<header id="sharedPublicHeader" class="perda-public-header">
  <nav class="navbar navbar-expand-lg perda-navbar" aria-label="Main Navigation">
    <div class="perda-navbar-container">
      <a class="navbar-brand" href="{{ route('landing') }}">
        <img src="{{ asset('images/logo.svg') }}" alt="e-Homestay PERDA Homestay Logo">
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#publicNavbarCollapse" aria-controls="publicNavbarCollapse" aria-expanded="false" aria-label="Toggle navigation menu">
        <i class="fa-solid fa-bars"></i>
      </button>
      <div class="collapse navbar-collapse" id="publicNavbarCollapse">
        <ul class="navbar-nav ms-lg-auto">
          <li class="nav-item">
            <a class="nav-link {{ request()->routeIs('landing') ? 'active' : '' }}" data-nav-key="home" href="{{ route('landing') }}">
              <i class="fa-solid fa-house"></i>
              <span>Home</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" data-nav-key="homestays" href="{{ route('landing') }}#homestaysSection">
              <i class="fa-solid fa-tree-city"></i>
              <span>Homestays</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" data-nav-key="track" href="{{ route('landing') }}#trackingSection">
              <i class="fa-solid fa-magnifying-glass-location"></i>
              <span>Track Booking</span>
            </a>
          </li>
          <li class="nav-item perda-navbar-cta">
            <a class="btn btn-sand perda-login-btn" href="{{ route('login') }}">
              <i class="fa-solid fa-right-to-bracket"></i>
              <span>Login / Portal</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</header>
