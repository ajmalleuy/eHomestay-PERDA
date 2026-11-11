{{-- ==========================================================================
     Shared Public Footer Partial (resources/views/partials/footer.blade.php)
     Dark Green (#283618) Footer with Cream (#FEFAE0) Text & Contact Info
     ========================================================================== --}}
<footer class="perda-footer">
  <div class="container">
    <div class="row g-4">
      <div class="col-lg-4">
        <img src="{{ asset('images/logo.svg') }}" alt="e-Homestay PERDA Logo" class="mb-3" style="height: 48px;">
        <p>
          <strong>e-Homestay PERDA</strong> is the official centralized platform for searching, booking, and managing rural homestays (Inap Desa) under the Penang Regional Development Authority (Lembaga Kemajuan Wilayah Pulau Pinang).
        </p>
      </div>
      <div class="col-sm-6 col-lg-2">
        <h5>Platform Pages</h5>
        <ul class="list-unstyled d-grid gap-2">
          <li><a href="{{ route('landing') }}"><i class="fa-solid fa-angle-right me-1"></i> Home &amp; Search</a></li>
          <li><a href="{{ route('booking.create') }}"><i class="fa-solid fa-angle-right me-1"></i> Book Homestay</a></li>
          <li><a href="{{ route('landing') }}#trackingSection"><i class="fa-solid fa-angle-right me-1"></i> Track Booking</a></li>
          <li><a href="{{ route('login') }}"><i class="fa-solid fa-angle-right me-1"></i> Staff &amp; Operator Login</a></li>
        </ul>
      </div>
      <div class="col-sm-6 col-lg-3">
        <h5>PERDA Homestay Districts</h5>
        <ul class="list-unstyled d-grid gap-2">
          <li><i class="fa-solid fa-location-dot me-2" style="color: var(--sand);"></i> Kepala Batas &amp; Tasek Gelugor</li>
          <li><i class="fa-solid fa-location-dot me-2" style="color: var(--sand);"></i> Mengkuang Titi, Bukit Mertajam</li>
          <li><i class="fa-solid fa-location-dot me-2" style="color: var(--sand);"></i> Kampung Pulau Betong, Balik Pulau</li>
          <li><i class="fa-solid fa-location-dot me-2" style="color: var(--sand);"></i> Sungai Acheh &amp; Pulau Aman</li>
        </ul>
      </div>
      <div class="col-lg-3">
        <h5>Contact PERDA</h5>
        <ul class="list-unstyled d-grid gap-2">
          <li><i class="fa-solid fa-building me-2" style="color: var(--sand);"></i> No. 1, Lorong Kampong Gajah 2, Jalan Kampong Gajah, 12200 Butterworth, Pulau Pinang</li>
          <li><i class="fa-solid fa-phone me-2" style="color: var(--sand);"></i> +604-314 1100</li>
          <li><i class="fa-solid fa-envelope me-2" style="color: var(--sand);"></i> bpe.homestay@perda.gov.my</li>
        </ul>
      </div>
    </div>
    <hr class="footer-divider">
    <div class="d-flex flex-wrap justify-content-between align-items-center small">
      <span>&copy; {{ date('Y') }} Lembaga Kemajuan Wilayah Pulau Pinang (PERDA). All Rights Reserved.</span>
      <span>Built with Laravel MVC, Bootstrap 5 &amp; MySQL</span>
    </div>
  </div>
</footer>

