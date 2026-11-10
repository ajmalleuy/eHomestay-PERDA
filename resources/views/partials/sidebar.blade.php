{{-- ==========================================================================
     Shared Portal Sidebar Partial (resources/views/partials/sidebar.blade.php)
     Dark Green (#283618) Collapsible Sidebar for Operators & BPE Officers
     ========================================================================== --}}
<div id="sidebarBackdrop" class="sidebar-backdrop"></div>

<aside id="portalSidebar" class="portal-sidebar" aria-label="Portal Sidebar Navigation">
  <div class="sidebar-brand-header">
    <a href="{{ route('landing') }}" class="d-flex align-items-center">
      <img src="{{ asset('images/logo.svg') }}" alt="e-Homestay PERDA Logo" style="height: 44px;">
    </a>
    <button type="button" id="sidebarCloseBtn" class="btn btn-sand btn-sm d-lg-none px-2" aria-label="Close sidebar">
      <i class="fa-solid fa-xmark"></i>
    </button>
  </div>

  <ul class="sidebar-nav-list">
    <li class="sidebar-nav-item">
      <a href="{{ route('dashboard') }}" class="sidebar-nav-link {{ request()->routeIs('dashboard') ? 'active' : '' }}">
        <i class="fa-solid fa-gauge-high"></i> Dashboard Overview
      </a>
    </li>
    <li class="sidebar-nav-item">
      <a href="{{ route('dashboard', ['role' => 'operator']) }}#operatorUnitsSection" class="sidebar-nav-link">
        <i class="fa-solid fa-house-chimney-window"></i> Homestay Units &amp; Block Dates
      </a>
    </li>
    <li class="sidebar-nav-item">
      <a href="{{ route('verification.index') }}" class="sidebar-nav-link {{ request()->routeIs('verification.*') ? 'active' : '' }}">
        <i class="fa-solid fa-file-circle-check"></i> Verification &amp; Approval
        <span class="badge-pill badge-rejected ms-auto py-1 px-2" style="font-size: 0.7rem;">3</span>
      </a>
    </li>
    <li class="sidebar-nav-item">
      <a href="{{ route('reports.index') }}" class="sidebar-nav-link {{ request()->routeIs('reports.*') ? 'active' : '' }}">
        <i class="fa-solid fa-chart-pie"></i> Officer Reports &amp; Export
      </a>
    </li>
    <li class="sidebar-nav-item mt-3 pt-3 border-top" style="border-color: rgba(221, 161, 94, 0.3) !important;">
      <a href="{{ route('landing') }}" class="sidebar-nav-link">
        <i class="fa-solid fa-globe"></i> Public Tourist View
      </a>
    </li>
    <li class="sidebar-nav-item">
      <form action="{{ route('logout') }}" method="POST" class="m-0">
        @csrf
        <button type="submit" class="sidebar-nav-link w-100 border-0 bg-transparent text-start">
          <i class="fa-solid fa-right-from-bracket"></i> Sign Out
        </button>
      </form>
    </li>
  </ul>
</aside>

