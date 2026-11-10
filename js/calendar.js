/**
 * ============================================================================
 * e-Homestay PERDA (Inap Desa) - Calendar & Availability Script (calendar.js)
 * 1. Tourist Real-Time Availability Calendar (Page 1: Landing & Details View)
 *    - Available dates: Olive Green (#606C38)
 *    - Unavailable/Blocked dates: Neutral Grey
 *    - Selected dates: Burnt Orange (#BC6C25)
 * 2. Operator Block Calendar Tool (Page 4: Operator Dashboard)
 *    - Block/unblock dates for maintenance or personal use to prevent double bookings
 * ============================================================================
 */

let currentSelectedHomestayId = 'hs-101';
let selectedTouristDates = ['2026-11-14', '2026-11-15'];
let currentCalMonth = 10; // November (0-indexed: 10 = Nov)
let currentCalYear = 2026;

/**
 * Format YYYY-MM-DD helper
 */
function formatDateISO(year, monthZeroIndexed, day) {
  const m = String(monthZeroIndexed + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

/**
 * ============================================================================
 * PART A: TOURIST HOMESTAY DETAILS & REAL-TIME AVAILABILITY CALENDAR (PAGE 1)
 * ============================================================================
 */
function initLandingCalendarAndCards() {
  const cardsContainer = document.getElementById('homestayCardsGrid');
  if (!cardsContainer) return;

  renderHomestayCards(getHomestays());
  loadHomestayDetails(currentSelectedHomestayId, false);

  // Quick Search Bar Filtering
  const searchForm = document.getElementById('quickSearchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const districtVal = document.getElementById('searchDistrict').value;
      const guestsVal = parseInt(document.getElementById('searchGuests').value || '1', 10);
      const checkInVal = document.getElementById('searchCheckIn').value;
      const checkOutVal = document.getElementById('searchCheckOut').value;

      if (checkInVal && checkOutVal && checkOutVal <= checkInVal) {
        showPerdaToast(
          'Invalid Date Range',
          'Check-out date must be at least 1 day after your check-in date.',
          'fa-triangle-exclamation'
        );
        return;
      }

      const allUnits = getHomestays();
      const filtered = allUnits.filter((unit) => {
        const matchDistrict =
          districtVal === 'ALL' ||
          unit.district.toLowerCase().includes(districtVal.toLowerCase()) ||
          unit.shortDistrict.toLowerCase().includes(districtVal.toLowerCase());
        const matchGuests = unit.maxGuests >= guestsVal;
        return matchDistrict && matchGuests;
      });

      renderHomestayCards(filtered);
      const countEl = document.getElementById('searchResultCount');
      if (countEl) {
        countEl.textContent = `Showing ${filtered.length} of ${allUnits.length} PERDA Homestays`;
      }

      document.getElementById('homestaysSection')?.scrollIntoView({ behavior: 'smooth' });
      showPerdaToast(
        'Search Updated',
        `Found ${filtered.length} homestay unit(s) matching your criteria.`,
        'fa-magnifying-glass'
      );
    });
  }

  // Reset Filter Button
  const resetBtn = document.getElementById('resetSearchBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      document.getElementById('quickSearchForm')?.reset();
      const all = getHomestays();
      renderHomestayCards(all);
      const countEl = document.getElementById('searchResultCount');
      if (countEl) countEl.textContent = `Showing all ${all.length} PERDA Homestays`;
    });
  }

  // Month Navigation Buttons on Tourist Calendar
  document.getElementById('calPrevMonthBtn')?.addEventListener('click', () => {
    currentCalMonth--;
    if (currentCalMonth < 0) {
      currentCalMonth = 11;
      currentCalYear--;
    }
    renderTouristAvailabilityCalendar();
  });

  document.getElementById('calNextMonthBtn')?.addEventListener('click', () => {
    currentCalMonth++;
    if (currentCalMonth > 11) {
      currentCalMonth = 0;
      currentCalYear++;
    }
    renderTouristAvailabilityCalendar();
  });

  // Proceed to Booking Button inside Details View
  document.getElementById('proceedToBookBtn')?.addEventListener('click', () => {
    const unit = getHomestays().find((h) => h.id === currentSelectedHomestayId) || getHomestays()[0];
    const sorted = [...selectedTouristDates].sort();
    const checkIn = sorted[0] || '2026-11-14';
    const nights = Math.max(1, sorted.length);
    const checkOutDate = new Date(checkIn);
    checkOutDate.setDate(checkOutDate.getDate() + nights);
    const checkOut = checkOutDate.toISOString().split('T')[0];

    const draft = {
      homestayId: unit.id,
      homestayName: unit.name,
      district: unit.shortDistrict,
      pricePerNight: unit.pricePerNight,
      maxGuests: unit.maxGuests,
      checkIn,
      checkOut,
      nights,
      guests: Math.min(4, unit.maxGuests),
      image: unit.image
    };
    try {
      localStorage.setItem('perda_booking_draft', JSON.stringify(draft));
    } catch (e) {}
    window.location.href = `booking.html?homestay=${encodeURIComponent(unit.id)}`;
  });
}

/**
 * Render Homestay Search Result Cards on Page 1
 */
function renderHomestayCards(units) {
  const grid = document.getElementById('homestayCardsGrid');
  if (!grid) return;

  if (units.length === 0) {
    grid.innerHTML = `
      <div class="col-12">
        <div class="perda-card p-5 text-center">
          <i class="fa-solid fa-house-circle-exclamation fa-3x mb-3" style="color: var(--burnt-orange);"></i>
          <h4 class="font-heading">No Homestays Match Your Filter</h4>
          <p class="mb-3">Try selecting "All PERDA Districts" or reducing the guest count.</p>
          <button type="button" class="btn btn-olive" onclick="document.getElementById('resetSearchBtn').click()">
            <i class="fa-solid fa-rotate-left"></i> Show All Homestays
          </button>
        </div>
      </div>
    `;
    return;
  }

  grid.innerHTML = units
    .map(
      (u) => `
      <article class="homestay-card" aria-label="${u.name}">
        <div class="homestay-card-img-wrap">
          <img src="${u.image}" alt="${u.name} in ${u.shortDistrict}" loading="lazy">
          <span class="homestay-district-tag">
            <i class="fa-solid fa-location-dot me-1" style="color: var(--sand);"></i> ${u.shortDistrict}
          </span>
          <span class="homestay-price-tag">
            RM ${u.pricePerNight} <small class="fw-normal">/ night</small>
          </span>
        </div>
        <div class="p-4 d-flex flex-column flex-grow-1">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="badge-pill badge-pending">
              <i class="fa-solid fa-users"></i> Up to ${u.maxGuests} Guests
            </span>
            <span class="small fw-semibold" style="color: var(--olive);">
              <i class="fa-solid fa-star" style="color: var(--burnt-orange);"></i> ${u.rating} (${u.reviewsCount})
            </span>
          </div>
          <h3 class="h5 font-heading mb-2">${u.name}</h3>
          <p class="small mb-3 flex-grow-1" style="color: var(--dark-green); opacity: 0.86;">
            ${u.description.substring(0, 115)}...
          </p>
          <div class="d-flex flex-wrap gap-1 mb-3">
            ${u.facilities
              .slice(0, 3)
              .map((f) => `<span class="homestay-facility-pill"><i class="fa-solid fa-check" style="color: var(--olive);"></i> ${f}</span>`)
              .join('')}
          </div>
          <div class="d-flex gap-2 mt-auto pt-2 border-top" style="border-color: var(--sand) !important;">
            <button type="button" class="btn btn-cta w-100" onclick="loadHomestayDetails('${u.id}', true)">
              <i class="fa-solid fa-calendar-check"></i> View &amp; Book
            </button>
          </div>
        </div>
      </article>
    `
    )
    .join('');
}

/**
 * Populate Homestay Details View & Gallery when user clicks "View & Book"
 */
function loadHomestayDetails(homestayId, scrollToSection = true) {
  const units = getHomestays();
  const unit = units.find((h) => h.id === homestayId) || units[0];
  if (!unit) return;

  currentSelectedHomestayId = unit.id;

  // Update Details Text
  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  setTxt('detailHomestayName', unit.name);
  setTxt('detailHomestayDistrict', unit.district);
  setTxt('detailHomestayLocation', unit.location);
  setTxt('detailHomestayPrice', `RM ${unit.pricePerNight}`);
  setTxt('detailHomestayGuests', `Max ${unit.maxGuests} Guests • ${unit.bedrooms} Bedrooms • ${unit.bathrooms} Bathrooms`);
  setTxt('detailHomestayDesc', unit.description);
  setTxt('detailOperatorName', unit.operatorName);

  // Update Main Image & Thumbnails
  const mainImg = document.getElementById('detailMainImage');
  if (mainImg) {
    mainImg.src = unit.image;
    mainImg.alt = `${unit.name} main photo`;
  }

  const thumbWrap = document.getElementById('detailGalleryThumbs');
  if (thumbWrap) {
    const galleryList = unit.gallery && unit.gallery.length ? unit.gallery : [unit.image, 'images/homestay-2.svg', 'images/homestay-3.svg'];
    thumbWrap.innerHTML = galleryList
      .map(
        (imgSrc, idx) => `
        <div class="col-4">
          <button type="button" class="gallery-thumb-btn ${idx === 0 ? 'active' : ''}" onclick="switchDetailGalleryImg(this, '${imgSrc}')" aria-label="View photo ${idx + 1}">
            <img src="${imgSrc}" alt="${unit.name} thumbnail ${idx + 1}">
          </button>
        </div>
      `
      )
      .join('');
  }

  // Update Facilities Pills
  const facWrap = document.getElementById('detailFacilitiesList');
  if (facWrap) {
    facWrap.innerHTML = unit.facilities
      .map(
        (fac) => `
        <span class="homestay-facility-pill py-2 px-3">
          <i class="fa-solid fa-circle-check" style="color: var(--olive);"></i> ${fac}
        </span>
      `
      )
      .join('');
  }

  // Pick 2 default available dates in November 2026
  selectedTouristDates = ['2026-11-14', '2026-11-15'].filter((d) => !unit.blockedDates.includes(d));
  if (selectedTouristDates.length === 0) {
    selectedTouristDates = ['2026-11-16', '2026-11-17'];
  }

  renderTouristAvailabilityCalendar();

  if (scrollToSection) {
    document.getElementById('homestayDetailsSection')?.scrollIntoView({ behavior: 'smooth' });
  }
}

function switchDetailGalleryImg(btnEl, imgSrc) {
  const mainImg = document.getElementById('detailMainImage');
  if (mainImg) mainImg.src = imgSrc;
  document.querySelectorAll('#detailGalleryThumbs .gallery-thumb-btn').forEach((b) => b.classList.remove('active'));
  btnEl.classList.add('active');
}

/**
 * Render the Interactive Tourist Availability Calendar
 * - Available: Olive Green (#606C38)
 * - Unavailable/Blocked: Grey
 * - Selected: Burnt Orange (#BC6C25)
 */
function renderTouristAvailabilityCalendar() {
  const calGrid = document.getElementById('touristCalendarDays');
  const monthLabel = document.getElementById('touristCalendarMonthLabel');
  if (!calGrid) return;

  const unit = getHomestays().find((h) => h.id === currentSelectedHomestayId) || getHomestays()[0];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (monthLabel) {
    monthLabel.textContent = `${monthNames[currentCalMonth]} ${currentCalYear}`;
  }

  const firstDayOfWeek = new Date(currentCalYear, currentCalMonth, 1).getDay();
  const daysInMonth = new Date(currentCalYear, currentCalMonth + 1, 0).getDate();

  let html = '';
  for (let i = 0; i < firstDayOfWeek; i++) {
    html += `<div class="cal-day empty" aria-hidden="true"></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const iso = formatDateISO(currentCalYear, currentCalMonth, day);
    const isBlocked = unit.blockedDates.includes(iso);
    const isSelected = selectedTouristDates.includes(iso);

    let stateClass = 'available';
    let titleText = `Available (RM ${unit.pricePerNight}/night) - Click to select`;
    if (isBlocked) {
      stateClass = 'unavailable';
      titleText = 'Unavailable / Blocked';
    } else if (isSelected) {
      stateClass = 'selected';
      titleText = 'Selected Stay Night - Click to deselect';
    }

    html += `
      <button type="button"
        class="cal-day ${stateClass}"
        title="${titleText}"
        aria-label="${iso} ${stateClass}"
        ${isBlocked ? 'disabled' : `onclick="toggleTouristDate('${iso}')"`}>
        <span>${day}</span>
      </button>
    `;
  }

  calGrid.innerHTML = html;
  updateSelectedStaySummary(unit);
}

function toggleTouristDate(isoDate) {
  const idx = selectedTouristDates.indexOf(isoDate);
  if (idx > -1) {
    if (selectedTouristDates.length > 1) {
      selectedTouristDates.splice(idx, 1);
    } else {
      showPerdaToast('Minimum 1 Night', 'Please keep at least 1 night selected for your booking.', 'fa-calendar-day');
    }
  } else {
    selectedTouristDates.push(isoDate);
    selectedTouristDates.sort();
  }
  renderTouristAvailabilityCalendar();
}

function updateSelectedStaySummary(unit) {
  const summaryEl = document.getElementById('selectedDatesSummaryText');
  const totalEl = document.getElementById('selectedDatesTotalPrice');
  if (!summaryEl || !totalEl) return;

  const nights = selectedTouristDates.length;
  const sorted = [...selectedTouristDates].sort();
  const totalRM = nights * unit.pricePerNight;

  summaryEl.textContent = `${nights} Night(s) Selected (${sorted.join(', ')})`;
  totalEl.textContent = `RM ${totalRM.toFixed(2)}`;
}

/**
 * ============================================================================
 * PART B: OPERATOR "BLOCK CALENDAR" TOOL (PAGE 4: DASHBOARD)
 * Allows operators to block/unblock dates for maintenance or personal use
 * ============================================================================
 */
let operatorActiveUnitId = 'hs-102';
let operatorCalMonth = 10; // November (0-indexed)
let operatorCalYear = 2026;

function initOperatorBlockCalendar() {
  const grid = document.getElementById('operatorBlockCalendarGrid');
  const unitSelect = document.getElementById('blockCalHomestaySelect');
  if (!grid || !unitSelect) return;

  // Populate unit dropdown
  const units = getHomestays();
  unitSelect.innerHTML = units
    .map((u) => `<option value="${u.id}" ${u.id === operatorActiveUnitId ? 'selected' : ''}>${u.name} (${u.shortDistrict})</option>`)
    .join('');

  if (!unitSelect.dataset.bound) {
    unitSelect.addEventListener('change', () => {
      operatorActiveUnitId = unitSelect.value;
      renderOperatorBlockCalendar();
    });
    unitSelect.dataset.bound = 'true';
  }

  renderOperatorBlockCalendar();
}

function changeOperatorCalMonth(delta) {
  operatorCalMonth += delta;
  if (operatorCalMonth < 0) {
    operatorCalMonth = 11;
    operatorCalYear--;
  } else if (operatorCalMonth > 11) {
    operatorCalMonth = 0;
    operatorCalYear++;
  }
  renderOperatorBlockCalendar();
}

function renderOperatorBlockCalendar() {
  const grid = document.getElementById('operatorBlockCalendarGrid');
  const blockedCountBadge = document.getElementById('blockedDatesCountBadge');
  const monthTitleEl = document.getElementById('operatorCalMonthTitle');
  const chipsContainer = document.getElementById('operatorBlockedChipsList');
  if (!grid) return;

  const units = getHomestays();
  const unit = units.find((u) => u.id === operatorActiveUnitId) || units[0];
  if (!unit) return;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (monthTitleEl) {
    monthTitleEl.textContent = `${monthNames[operatorCalMonth]} ${operatorCalYear}`;
  }

  const firstDayOfWeek = new Date(operatorCalYear, operatorCalMonth, 1).getDay();
  const daysInMonth = new Date(operatorCalYear, operatorCalMonth + 1, 0).getDate();
  const bookedDates = ['2026-11-14', '2026-11-15', '2026-11-20', '2026-12-05', '2026-12-06'];

  let html = '';

  // Leading empty slots for weekday alignment
  for (let i = 0; i < firstDayOfWeek; i++) {
    html += `<div class="operator-block-day empty-slot" aria-hidden="true"></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const iso = formatDateISO(operatorCalYear, operatorCalMonth, day);
    const isBooked = bookedDates.includes(iso);
    const isBlocked = unit.blockedDates.includes(iso);

    let cls = 'open';
    let label = 'Open';
    let icon = 'fa-check';
    if (isBooked) {
      cls = 'booked';
      label = 'Booked';
      icon = 'fa-user-check';
    } else if (isBlocked) {
      cls = 'blocked';
      label = 'Blocked';
      icon = 'fa-lock';
    }

    html += `
      <button type="button"
        class="operator-block-day ${cls}"
        ${isBooked ? 'disabled title="Confirmed Guest Booking — Cannot modify"' : `onclick="toggleOperatorBlockedDate('${iso}')" title="Click to toggle block status for ${iso}"`}
        aria-label="${iso} - ${label}">
        <span class="day-num">${day}</span>
        <span class="day-status-pill">
          <i class="fa-solid ${icon}"></i> ${label}
        </span>
      </button>
    `;
  }

  // Trailing empty slots to complete the 7-column row cleanly
  const totalCells = firstDayOfWeek + daysInMonth;
  const trailing = (7 - (totalCells % 7)) % 7;
  for (let i = 0; i < trailing; i++) {
    html += `<div class="operator-block-day empty-slot" aria-hidden="true"></div>`;
  }

  grid.innerHTML = html;

  if (blockedCountBadge) {
    blockedCountBadge.innerHTML = `<i class="fa-solid fa-ban me-1"></i> ${unit.blockedDates.length} Blocked Date(s)`;
  }

  if (chipsContainer) {
    if (unit.blockedDates.length === 0) {
      chipsContainer.innerHTML = `<span class="small" style="color: var(--olive);"><i class="fa-solid fa-circle-check me-1"></i> All dates are currently open for tourist bookings.</span>`;
    } else {
      chipsContainer.innerHTML = unit.blockedDates
        .map(
          (iso) => `
          <span class="blocked-date-chip">
            <i class="fa-solid fa-lock" style="color: var(--burnt-orange);"></i>
            <span>${iso}</span>
            <button type="button" onclick="toggleOperatorBlockedDate('${iso}')" title="Unblock ${iso}" aria-label="Unblock ${iso}">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </span>
        `
        )
        .join('');
    }
  }
}

function toggleOperatorBlockedDate(isoDate) {
  const units = getHomestays();
  const unit = units.find((u) => u.id === operatorActiveUnitId);
  if (!unit) return;

  const reasonSelect = document.getElementById('blockReasonSelect');
  const reasonText = reasonSelect ? reasonSelect.value : 'Maintenance';

  const idx = unit.blockedDates.indexOf(isoDate);
  if (idx > -1) {
    unit.blockedDates.splice(idx, 1);
    showPerdaToast(
      'Date Re-Opened for Booking',
      `${isoDate} is now available for tourists on ${unit.name}.`,
      'fa-calendar-check'
    );
  } else {
    unit.blockedDates.push(isoDate);
    unit.blockedDates.sort();
    showPerdaToast(
      `Date Blocked (${reasonText})`,
      `${isoDate} has been blocked on ${unit.name} to prevent double bookings.`,
      'fa-calendar-xmark'
    );
  }

  saveHomestays(units);
  renderOperatorBlockCalendar();
  if (typeof renderOperatorHomestaysList === 'function') {
    renderOperatorHomestaysList();
  }
}

function clearAllUnitBlockedDates() {
  const units = getHomestays();
  const unit = units.find((u) => u.id === operatorActiveUnitId);
  if (!unit) return;
  unit.blockedDates = [];
  saveHomestays(units);
  renderOperatorBlockCalendar();
  if (typeof renderOperatorHomestaysList === 'function') {
    renderOperatorHomestaysList();
  }
  showPerdaToast('All Dates Unblocked', `All blocked dates on ${unit.name} have been re-opened.`, 'fa-calendar-check');
}

document.addEventListener('DOMContentLoaded', () => {
  initLandingCalendarAndCards();
  initOperatorBlockCalendar();
});

