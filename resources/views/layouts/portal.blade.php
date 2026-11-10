{{-- ==========================================================================
     Internal Portal Master Layout (resources/views/layouts/portal.blade.php)
     Used by Page 4 (Dashboard), Page 5 (Verification), and Page 6 (Reports)
     ========================================================================== --}}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>@yield('title', 'Management Portal — e-Homestay PERDA')</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" rel="stylesheet">
  <link rel="stylesheet" href="{{ asset('css/main.css') }}">
  <link rel="stylesheet" href="{{ asset('css/dashboard.css') }}">
  @stack('styles')
</head>
<body>
  <a href="#mainContent" class="skip-link">Skip to main content</a>

  <div class="portal-layout">
    @include('partials.sidebar')

    <div class="portal-main-content">
      @yield('topbar')

      <main id="mainContent" class="p-3 p-md-4">
        @yield('content')
      </main>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="{{ asset('js/main.js') }}"></script>
  @stack('scripts')
</body>
</html>

