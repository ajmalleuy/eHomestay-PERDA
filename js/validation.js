/**
 * ============================================================================
 * e-Homestay PERDA (Inap Desa) - Form Validation & Workflow Script (validation.js)
 * Handles form validation and interactive workflows across:
 * - Page 1: Tourist Registration Form (with PERDA promotional email opt-in)
 * - Page 2: Booking Form, Reference Number Generator & Status Tracker
 * - Page 3: Operator & BPE Officer Login (Verified Official Admin Email Check)
 * - Page 4: Operator Add/Edit Homestay Unit Management
 * - Page 5: Operator Booking Verification, 24h Countdown Timer & Approval Modal
 * ============================================================================
 */

/**
 * Helper: Show or clear inline field validation error
 */
function setFieldError(inputEl, errorElId, message) {
  const errEl = document.getElementById(errorElId);
  if (!inputEl) return false;
  if (message) {
    inputEl.classList.add('is-invalid');
    if (errEl) {
      errEl.textContent = message;
      errEl.classList.add('show');
    }
    return false;
  } else {
    inputEl.classList.remove('is-invalid');
    if (errEl) errEl.classList.remove('show');
    return true;
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s()]{9,16}$/;

/**
 * ============================================================================
 * 1. PAGE 1: TOURIST REGISTRATION FORM VALIDATION
 * ============================================================================
 */
function initTouristRegistrationForm() {
  const form = document.getElementById('touristRegisterForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('regFullName');
    const emailInput = document.getElementById('regEmail');
    const phoneInput = document.getElementById('regPhone');
    const passInput = document.getElementById('regPassword');
    const confirmInput = document.getElementById('regConfirmPassword');
    const promoCheckbox = document.getElementById('regPromoOptIn');

    let isValid = true;

    if (!nameInput.value.trim() || nameInput.value.trim().length < 3) {
      isValid = setFieldError(nameInput, 'regFullNameErr', 'Please enter your full name (minimum 3 characters).');
    } else {
      setFieldError(nameInput, 'regFullNameErr', '');
    }

    if (!EMAIL_REGEX.test(emailInput.value.trim())) {
      isValid = setFieldError(emailInput, 'regEmailErr', 'Please enter a valid email address (e.g., name@email.com).') && isValid;
    } else {
      setFieldError(emailInput, 'regEmailErr', '');
    }

    if (!PHONE_REGEX.test(phoneInput.value.trim())) {
      isValid = setFieldError(phoneInput, 'regPhoneErr', 'Please enter a valid Malaysian phone number (e.g., +60 12-345 6789).') && isValid;
    } else {
      setFieldError(phoneInput, 'regPhoneErr', '');
    }

    if (!passInput.value || passInput.value.length < 8) {
      isValid = setFieldError(passInput, 'regPasswordErr', 'Password must be at least 8 characters long.') && isValid;
    } else {
      setFieldError(passInput, 'regPasswordErr', '');
    }

    if (confirmInput.value !== passInput.value || !confirmInput.value) {
      isValid = setFieldError(confirmInput, 'regConfirmPasswordErr', 'Passwords do not match. Please re-enter.') && isValid;
    } else {
      setFieldError(confirmInput, 'regConfirmPasswordErr', '');
    }

    if (!isValid) {
      showPerdaToast('Registration Incomplete', 'Please fix the highlighted fields before submitting.', 'fa-circle-exclamation');
      return;
    }

    const optInStatus = promoCheckbox?.checked
      ? 'Subscribed to PERDA promotional emails'
      : 'No promotional emails selected';

    const successBanner = document.getElementById('regSuccessBanner');
    if (successBanner) {
      successBanner.innerHTML = `
        <div class="p-3 rounded-4 mt-3" style="background-color: var(--olive); color: var(--cream);">
          <div class="fw-bold"><i class="fa-solid fa-circle-check me-2"></i> Welcome to e-Homestay PERDA, ${nameInput.value.trim()}!</div>
          <div class="small mt-1">Your tourist account (${emailInput.value.trim()}) is now active. Preference: ${optInStatus}.</div>
        </div>
      `;
    }

    showPerdaToast('Tourist Account Created', `Welcome aboard, ${nameInput.value.trim()}! You can now book any PERDA homestay.`, 'fa-user-check');
    form.reset();
  });
}

/**
 * ============================================================================
 * 2. PAGE 2: BOOKING FORM, CONFIRMATION & REFERENCE STATUS TRACKING
 * ============================================================================
 */
function initBookingFormAndTracker() {
  const bookingForm = document.getElementById('touristBookingForm');
  const homestaySelect = document.getElementById('bookingHomestaySelect');
  const checkInInput = document.getElementById('bookingCheckIn');
  const checkOutInput = document.getElementById('bookingCheckOut');
  const guestsInput = document.getElementById('bookingGuests');

  if (bookingForm && homestaySelect) {
    const units = getHomestays();
    homestaySelect.innerHTML = units
      .map((u) => `<option value="${u.id}">${u.name} (${u.shortDistrict}) — RM ${u.pricePerNight}/night</option>`)
      .join('');

    // Check URL query param or saved draft from Page 1
    const params = new URLSearchParams(window.location.search);
    const paramId = params.get('homestay');
    try {
      const savedDraft = JSON.parse(localStorage.getItem('perda_booking_draft') || 'null');
      if (savedDraft) {
        homestaySelect.value = paramId || savedDraft.homestayId || 'hs-101';
        if (checkInInput && savedDraft.checkIn) checkInInput.value = savedDraft.checkIn;
        if (checkOutInput && savedDraft.checkOut) checkOutInput.value = savedDraft.checkOut;
        if (guestsInput && savedDraft.guests) guestsInput.value = savedDraft.guests;
      } else if (paramId) {
        homestaySelect.value = paramId;
      }
    } catch (e) {}

    const recalculateSummary = () => {
      const unit = units.find((u) => u.id === homestaySelect.value) || units[0];
      const d1 = new Date(checkInInput.value);
      const d2 = new Date(checkOutInput.value);
      let nights = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
      if (isNaN(nights) || nights < 1) nights = 1;

      const guests = parseInt(guestsInput.value || '2', 10);
      const subtotal = nights * unit.pricePerNight;

      const setTxt = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };

      setTxt('summaryHomestayName', unit.name);
      setTxt('summaryDistrictName', unit.district);
      setTxt('summaryCheckInDate', checkInInput.value || '2026-11-14');
      setTxt('summaryCheckOutDate', checkOutInput.value || '2026-11-16');
      setTxt('summaryNightsCount', `${nights} Night(s)`);
      setTxt('summaryGuestsCount', `${guests} Guest(s) (Max ${unit.maxGuests})`);
      setTxt('summaryRatePerNight', `RM ${unit.pricePerNight.toFixed(2)}`);
      setTxt('summaryTotalPrice', `RM ${subtotal.toFixed(2)}`);

      const imgEl = document.getElementById('summaryHomestayImg');
      if (imgEl) imgEl.src = unit.image;

      return { unit, nights, guests, subtotal };
    };

    [homestaySelect, checkInInput, checkOutInput, guestsInput].forEach((el) => {
      el?.addEventListener('change', recalculateSummary);
    });
    recalculateSummary();

    // Form Submit Handler
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const summary = recalculateSummary();

      const fullNameEl = document.getElementById('touristFullName');
      const phoneEl = document.getElementById('touristPhone');
      const emailEl = document.getElementById('touristEmail');
      const requestsEl = document.getElementById('touristSpecialRequests');

      let valid = true;

      if (!fullNameEl.value.trim() || fullNameEl.value.trim().length < 3) {
        valid = setFieldError(fullNameEl, 'touristFullNameErr', 'Please enter the primary guest full name.');
      } else {
        setFieldError(fullNameEl, 'touristFullNameErr', '');
      }

      if (!PHONE_REGEX.test(phoneEl.value.trim())) {
        valid = setFieldError(phoneEl, 'touristPhoneErr', 'Please enter a valid contact phone number.') && valid;
      } else {
        setFieldError(phoneEl, 'touristPhoneErr', '');
      }

      if (!EMAIL_REGEX.test(emailEl.value.trim())) {
        valid = setFieldError(emailEl, 'touristEmailErr', 'Please enter a valid email address for booking confirmation.') && valid;
      } else {
        setFieldError(emailEl, 'touristEmailErr', '');
      }

      if (checkOutInput.value <= checkInInput.value) {
        valid = setFieldError(checkOutInput, 'bookingDatesErr', 'Check-out date must be after check-in date.') && valid;
      } else {
        setFieldError(checkOutInput, 'bookingDatesErr', '');
      }

      const gCount = parseInt(guestsInput.value || '1', 10);
      if (gCount < 1 || gCount > summary.unit.maxGuests) {
        valid = setFieldError(guestsInput, 'bookingGuestsErr', `This homestay allows between 1 and ${summary.unit.maxGuests} guests.`) && valid;
      } else {
        setFieldError(guestsInput, 'bookingGuestsErr', '');
      }

      // Check Payment Proof Upload
      const fileErrorBox = document.getElementById('paymentFileErrorBox');
      const fileErrorText = document.getElementById('paymentFileErrorText');
      if (!window.validPaymentProofFile) {
        valid = false;
        if (fileErrorText) {
          fileErrorText.textContent = 'Please upload your payment receipt (JPG, PNG, or PDF, maximum 5MB) before submitting.';
        }
        fileErrorBox?.classList.add('show');
      }

      if (!valid) {
        showPerdaToast('Please Check Your Form', 'Complete all required fields and attach a valid payment receipt.', 'fa-triangle-exclamation');
        return;
      }

      // Generate Unique Booking Reference Number
      const randomDigits = Math.floor(10000 + Math.random() * 90000);
      const newRef = `PERDA-2026-${randomDigits}`;

      const newBooking = {
        ref: newRef,
        homestayId: summary.unit.id,
        homestayName: summary.unit.name,
        district: summary.unit.shortDistrict,
        guestName: fullNameEl.value.trim(),
        guestPhone: phoneEl.value.trim(),
        guestEmail: emailEl.value.trim(),
        checkIn: checkInInput.value,
        checkOut: checkOutInput.value,
        nights: summary.nights,
        guests: summary.guests,
        totalAmount: summary.subtotal,
        specialRequests: requestsEl.value.trim() || 'No special requests.',
        receiptFile: window.validPaymentProofFile.name,
        receiptUrl: 'images/sample-receipt.svg',
        status: 'Pending',
        remainingSeconds: 86395, // 24 hours countdown for operator verification
        createdAt: 'Just now (06 Nov 2026)'
      };

      const allBookings = getBookings();
      allBookings.unshift(newBooking);
      saveBookings(allBookings);

      // Show Confirmation Screen with Reference Number
      document.getElementById('bookingFormContainer')?.classList.add('d-none');
      const confirmScreen = document.getElementById('bookingConfirmationScreen');
      if (confirmScreen) {
        confirmScreen.classList.remove('d-none');
        document.getElementById('confirmedRefCode').textContent = newRef;
        document.getElementById('confirmedGuestName').textContent = newBooking.guestName;
        document.getElementById('confirmedHomestayName').textContent = newBooking.homestayName;
        document.getElementById('confirmedDatesText').textContent = `${newBooking.checkIn} to ${newBooking.checkOut} (${newBooking.nights} Nights)`;
        document.getElementById('confirmedTotalPaid').textContent = `RM ${newBooking.totalAmount.toFixed(2)}`;
        confirmScreen.scrollIntoView({ behavior: 'smooth' });
      }

      // Save latest reference code so landing page tracker can auto-display it
      try {
        localStorage.setItem('perda_last_booking_ref', newRef);
      } catch (e) {}

      // Auto-populate tracking input if present on current page
      const trackInput = document.getElementById('trackRefInput');
      if (trackInput) {
        trackInput.value = newRef;
        renderTrackingResult(newRef);
      }

      showPerdaToast('Booking Submitted!', `Reference ${newRef} created. Operator has 24 hours to verify your payment.`, 'fa-circle-check');
    });
  }

  // Booking Status Tracking Search Handler
  const trackForm = document.getElementById('bookingTrackForm');
  if (trackForm) {
    trackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const refInput = document.getElementById('trackRefInput');
      const query = (refInput?.value || '').trim().toUpperCase();
      if (!query) {
        setFieldError(refInput, 'trackRefErr', 'Please enter a booking reference number (e.g., PERDA-2026-84920).');
        return;
      }
      setFieldError(refInput, 'trackRefErr', '');
      renderTrackingResult(query);
    });

    // Load recent booking reference or default tracking sample on initial view
    let initialRef = 'PERDA-2026-84920';
    try {
      const savedRef = localStorage.getItem('perda_last_booking_ref');
      if (savedRef) {
        initialRef = savedRef;
        const refInput = document.getElementById('trackRefInput');
        if (refInput) refInput.value = savedRef;
      }
    } catch (e) {}
    renderTrackingResult(initialRef);
  }
}

function quickTrackRef(refCode) {
  const input = document.getElementById('trackRefInput');
  if (input) input.value = refCode;
  renderTrackingResult(refCode);
  document.getElementById('trackingSection')?.scrollIntoView({ behavior: 'smooth' });
}

function renderTrackingResult(refCode) {
  const resultBox = document.getElementById('trackingResultContainer');
  if (!resultBox) return;

  const found = getBookings().find((b) => b.ref.toUpperCase() === refCode.toUpperCase());

  if (!found) {
    resultBox.innerHTML = `
      <div class="tracking-result-card text-center py-4">
        <i class="fa-solid fa-magnifying-glass-minus fa-2x mb-2" style="color: var(--burnt-orange);"></i>
        <h5 class="font-heading mb-1">No Booking Found for "${refCode}"</h5>
        <p class="small mb-0">Please check your reference code or click one of the sample reference numbers above.</p>
      </div>
    `;
    return;
  }

  let badgeClass = 'badge-pending';
  let statusIcon = 'fa-clock';
  let statusNote = 'Your payment proof has been received and is awaiting operator verification (within 24 hours).';

  if (found.status === 'Approved') {
    badgeClass = 'badge-approved';
    statusIcon = 'fa-circle-check';
    statusNote = 'Your booking is confirmed! Please present this reference number upon check-in at the homestay.';
  } else if (found.status === 'Rejected') {
    badgeClass = 'badge-rejected';
    statusIcon = 'fa-circle-xmark';
    statusNote = found.rejectionReason || 'Your payment proof could not be verified. Please contact the operator or re-upload a clear receipt.';
  }

  resultBox.innerHTML = `
    <div class="tracking-result-card">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 pb-3 mb-3 border-bottom" style="border-color: var(--sand) !important;">
        <div>
          <span class="small text-uppercase fw-bold" style="color: var(--olive);">Booking Reference</span>
          <h4 class="font-heading mb-0">${found.ref}</h4>
        </div>
        <span class="badge-pill ${badgeClass} fs-6">
          <i class="fa-solid ${statusIcon}"></i> ${found.status}
        </span>
      </div>
      <div class="row g-3 mb-3">
        <div class="col-sm-6 col-md-3">
          <div class="small" style="color: var(--olive);">Homestay Unit</div>
          <div class="fw-semibold">${found.homestayName}</div>
        </div>
        <div class="col-sm-6 col-md-3">
          <div class="small" style="color: var(--olive);">Guest Name</div>
          <div class="fw-semibold">${found.guestName}</div>
        </div>
        <div class="col-sm-6 col-md-3">
          <div class="small" style="color: var(--olive);">Check-In / Check-Out</div>
          <div class="fw-semibold">${found.checkIn} → ${found.checkOut}</div>
        </div>
        <div class="col-sm-6 col-md-3">
          <div class="small" style="color: var(--olive);">Total Amount Paid</div>
          <div class="fw-bold" style="color: var(--burnt-orange);">RM ${Number(found.totalAmount).toFixed(2)}</div>
        </div>
      </div>
      <div class="p-3 rounded-3" style="background-color: var(--white); border: 1px solid var(--sand);">
        <i class="fa-solid fa-circle-info me-2" style="color: var(--olive);"></i>
        <span class="small fw-medium">${statusNote}</span>
      </div>
    </div>
  `;
}

/**
 * ============================================================================
 * 3. PAGE 3: UNIFIED INTERNAL LOGIN (Operators & BPE PERDA Officers)
 *    Enforces that Admin login ONLY accepts registered & verified official
 *    PERDA administrator emails (@perda.gov.my).
 * ============================================================================
 */
let currentLoginRole = 'operator'; // 'operator' or 'admin'

function initInternalLoginPage() {
  const loginForm = document.getElementById('internalLoginForm');
  if (!loginForm) return;

  const roleOperatorBtn = document.getElementById('roleTabOperator');
  const roleAdminBtn = document.getElementById('roleTabAdmin');
  const roleHintBox = document.getElementById('loginRolePolicyText');
  const emailInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPassword');
  const togglePassBtn = document.getElementById('togglePasswordBtn');
  const errorBanner = document.getElementById('loginErrorBanner');
  const errorBannerText = document.getElementById('loginErrorBannerText');

  const updateRoleUI = (role) => {
    currentLoginRole = role;
    errorBanner?.classList.remove('show');
    if (role === 'admin') {
      roleAdminBtn?.classList.add('active');
      roleOperatorBtn?.classList.remove('active');
      if (roleHintBox) {
        roleHintBox.innerHTML = `<i class="fa-solid fa-shield-halved me-1" style="color: var(--burnt-orange);"></i> <strong>BPE PERDA Officer (Admin) Policy:</strong> Only registered and verified official PERDA administrator emails (<code>@perda.gov.my</code>) are permitted.`;
      }
      if (emailInput) emailInput.placeholder = 'officer.bpe@perda.gov.my';
    } else {
      roleOperatorBtn?.classList.add('active');
      roleAdminBtn?.classList.remove('active');
      if (roleHintBox) {
        roleHintBox.innerHTML = `<i class="fa-solid fa-house-user me-1" style="color: var(--olive);"></i> <strong>Homestay Operator Portal:</strong> Sign in with your registered PERDA Homestay operator email to manage units &amp; verify bookings.`;
      }
      if (emailInput) emailInput.placeholder = 'operator@homestayperda.my';
    }
  };

  roleOperatorBtn?.addEventListener('click', () => updateRoleUI('operator'));
  roleAdminBtn?.addEventListener('click', () => updateRoleUI('admin'));

  // Show / Hide Password Toggle
  if (togglePassBtn && passInput) {
    togglePassBtn.addEventListener('click', () => {
      const isHidden = passInput.type === 'password';
      passInput.type = isHidden ? 'text' : 'password';
      togglePassBtn.innerHTML = isHidden
        ? '<i class="fa-solid fa-eye-slash"></i>'
        : '<i class="fa-solid fa-eye"></i>';
      togglePassBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    });
  }

  // Quick Demo Fill Buttons
  window.fillLoginDemo = (role, email, password) => {
    updateRoleUI(role);
    if (emailInput) emailInput.value = email;
    if (passInput) passInput.value = password;
  };

  // Login Submit Validation
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = (emailInput?.value || '').trim().toLowerCase();
    const password = passInput?.value || '';

    const showLoginErr = (msg) => {
      if (errorBannerText) errorBannerText.innerHTML = msg;
      errorBanner?.classList.add('show');
    };

    if (!EMAIL_REGEX.test(email)) {
      showLoginErr('Please enter a valid email address before signing in.');
      return;
    }

    if (!password || password.length < 6) {
      showLoginErr('Invalid password. Password must contain at least 6 characters.');
      return;
    }

    // Strict check for BPE PERDA Officer (Admin) Login
    if (currentLoginRole === 'admin') {
      const verifiedAdmin = VERIFIED_ADMIN_ACCOUNTS.find(
        (acc) => acc.email.toLowerCase() === email && acc.verified
      );

      if (!email.endsWith('@perda.gov.my')) {
        showLoginErr(
          `Access Denied: <strong>"${email}"</strong> is not an official PERDA domain. Admin login only accepts registered and verified official administrator emails ending with <code>@perda.gov.my</code>.`
        );
        return;
      }

      if (!verifiedAdmin) {
        showLoginErr(
          `Unverified Administrator Account: <strong>"${email}"</strong> is not registered or verified in the BPE PERDA Officer directory. Please contact PERDA ICT Support.`
        );
        return;
      }

      if (password !== 'PerdaAdmin2026!' && password.length < 6) {
        showLoginErr('Incorrect administrator password. Please try again.');
        return;
      }

      errorBanner?.classList.remove('show');
      try {
        localStorage.setItem('perda_active_role', 'officer');
      } catch (err) {}
      showPerdaToast('Officer Login Verified', `Welcome, ${verifiedAdmin.name}. Redirecting to PERDA Officer Dashboard...`, 'fa-user-shield');
      setTimeout(() => {
        window.location.href = 'dashboard.html?role=officer';
      }, 900);
    } else {
      // Operator Login Check
      const operatorAcc = REGISTERED_OPERATOR_ACCOUNTS.find((op) => op.email.toLowerCase() === email);
      if (!operatorAcc) {
        showLoginErr(
          `Operator Account Not Found: No registered PERDA homestay operator matches <strong>"${email}"</strong>. Use <code>operator@homestayperda.my</code> to test.`
        );
        return;
      }

      errorBanner?.classList.remove('show');
      setActiveOperatorByEmail(operatorAcc.email);
      try {
        localStorage.setItem('perda_active_role', 'operator');
      } catch (err) {}
      showPerdaToast('Operator Login Successful', `Welcome back, ${operatorAcc.name} (${operatorAcc.unitName})! Redirecting to your dashboard...`, 'fa-house-laptop');
      setTimeout(() => {
        window.location.href = 'dashboard.html?role=operator';
      }, 900);
    }
  });

  // Forgot Password Form Handler
  const forgotForm = document.getElementById('forgotPasswordForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const resetEmailInput = document.getElementById('resetPasswordEmail');
      const resetMsg = document.getElementById('forgotPasswordFeedback');
      const val = (resetEmailInput?.value || '').trim();
      if (!EMAIL_REGEX.test(val)) {
        if (resetMsg) {
          resetMsg.innerHTML = `<div class="small mt-2 fw-semibold" style="color: var(--burnt-orange);">Please enter a valid registered email address.</div>`;
        }
        return;
      }
      if (resetMsg) {
        resetMsg.innerHTML = `<div class="p-2 rounded-3 small mt-2 fw-semibold" style="background: var(--olive); color: var(--cream);"><i class="fa-solid fa-paper-plane me-1"></i> Password reset link sent to ${val}.</div>`;
      }
    });
  }
}

/**
 * ============================================================================
 * 4. PAGE 4: DASHBOARD ROLE SWITCHER & OPERATOR ADD/EDIT HOMESTAY FORM
 * ============================================================================
 */
function initDashboardPage() {
  const officerSection = document.getElementById('officerDashboardView');
  const operatorSection = document.getElementById('operatorDashboardView');
  const switchOfficerBtn = document.getElementById('switchToOfficerBtn');
  const switchOperatorBtn = document.getElementById('switchToOperatorBtn');
  const activeRoleBadge = document.getElementById('dashboardActiveRoleBadge');

  if (!officerSection || !operatorSection) return;

  const setDashboardRole = (role) => {
    if (role === 'operator') {
      officerSection.classList.add('d-none');
      operatorSection.classList.remove('d-none');
      switchOperatorBtn?.classList.replace('btn-outline-olive', 'btn-olive');
      switchOfficerBtn?.classList.replace('btn-olive', 'btn-outline-olive');
      if (activeRoleBadge) {
        activeRoleBadge.innerHTML = '<i class="fa-solid fa-house-user"></i> Viewing: Homestay Operator Dashboard';
      }
    } else {
      operatorSection.classList.add('d-none');
      officerSection.classList.remove('d-none');
      switchOfficerBtn?.classList.replace('btn-outline-olive', 'btn-olive');
      switchOperatorBtn?.classList.replace('btn-olive', 'btn-outline-olive');
      if (activeRoleBadge) {
        activeRoleBadge.innerHTML = '<i class="fa-solid fa-user-shield"></i> Viewing: BPE PERDA Officer (Admin) Dashboard';
      }
    }
  };

  const urlRole = new URLSearchParams(window.location.search).get('role');
  if (urlRole === 'operator') {
    setDashboardRole('operator');
  }

  switchOfficerBtn?.addEventListener('click', () => setDashboardRole('officer'));
  switchOperatorBtn?.addEventListener('click', () => setDashboardRole('operator'));

  // Populate Operator Account Switcher (1 Operator = 1 Homestay Ownership)
  const opSelect = document.getElementById('activeOperatorAccountSelect');
  if (opSelect) {
    const activeOp = getActiveOperator();
    opSelect.innerHTML = REGISTERED_OPERATOR_ACCOUNTS.map(
      (op) =>
        `<option value="${op.email}" ${op.email === activeOp.email ? 'selected' : ''}>
          ${op.name} — Owns: ${op.unitName}
        </option>`
    ).join('');

    opSelect.addEventListener('change', () => {
      setActiveOperatorByEmail(opSelect.value);
      const newOp = getActiveOperator();
      syncOperatorSingleHomestayView();
      showPerdaToast(
        'Switched Operator Account',
        `Now signed in as ${newOp.name}. You can only edit and block dates for "${newOp.unitName}".`,
        'fa-user-lock'
      );
    });
  }

  // Initialize Operator's Owned Homestay Form, Block Calendar & Directory Table
  syncOperatorSingleHomestayView();

  const unitForm = document.getElementById('operatorHomestayForm');
  if (unitForm) {
    unitForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const activeOp = getActiveOperator();
      const myUnit = getOperatorOwnedHomestay();
      const editId = document.getElementById('unitEditId').value || myUnit.id;

      // Enforce 1-Operator-1-Homestay Ownership Security Rule
      if (editId !== activeOp.homestayId) {
        showPerdaToast(
          'Ownership Permission Denied',
          `You can only edit your own homestay (${myUnit.name}), not units owned by other operators.`,
          'fa-lock'
        );
        return;
      }

      const nameEl = document.getElementById('unitNameInput');
      const districtEl = document.getElementById('unitDistrictInput');
      const capacityEl = document.getElementById('unitCapacityInput');
      const priceEl = document.getElementById('unitPriceInput');
      const imageEl = document.getElementById('unitImageSelect');
      const descEl = document.getElementById('unitDescInput');

      let ok = true;
      if (!nameEl.value.trim() || nameEl.value.trim().length < 4) {
        ok = setFieldError(nameEl, 'unitNameErr', 'Please enter a valid homestay name (min 4 chars).');
      } else {
        setFieldError(nameEl, 'unitNameErr', '');
      }

      const cap = parseInt(capacityEl.value || '0', 10);
      if (cap < 1 || cap > 25) {
        ok = setFieldError(capacityEl, 'unitCapacityErr', 'Guest capacity must be between 1 and 25.') && ok;
      } else {
        setFieldError(capacityEl, 'unitCapacityErr', '');
      }

      const price = parseFloat(priceEl.value || '0');
      if (price < 50 || price > 2500) {
        ok = setFieldError(priceEl, 'unitPriceErr', 'Nightly rate must be between RM 50 and RM 2,500.') && ok;
      } else {
        setFieldError(priceEl, 'unitPriceErr', '');
      }

      if (!descEl.value.trim() || descEl.value.trim().length < 15) {
        ok = setFieldError(descEl, 'unitDescErr', 'Please provide a welcoming description (at least 15 characters).') && ok;
      } else {
        setFieldError(descEl, 'unitDescErr', '');
      }

      if (!ok) return;

      const list = getHomestays();
      const target = list.find((u) => u.id === activeOp.homestayId);
      if (target) {
        target.name = nameEl.value.trim();
        target.shortDistrict = districtEl.value;
        target.district = districtEl.value;
        target.maxGuests = cap;
        target.pricePerNight = price;
        target.image = imageEl.value;
        target.description = descEl.value.trim();
      }

      saveHomestays(list);
      syncOperatorSingleHomestayView();
      showPerdaToast(
        'Your Homestay Updated',
        `Changes to "${nameEl.value.trim()}" have been saved.`,
        'fa-circle-check'
      );
    });
  }
}

function syncOperatorSingleHomestayView() {
  const activeOp = getActiveOperator();
  const myUnit = getOperatorOwnedHomestay();

  const bannerName = document.getElementById('activeOperatorBannerName');
  const bannerUnit = document.getElementById('activeOperatorBannerUnit');
  if (bannerName) bannerName.textContent = `${activeOp.name} (${activeOp.email})`;
  if (bannerUnit) bannerUnit.textContent = myUnit.name;

  loadUnitForEdit(myUnit.id, false);
  renderOperatorHomestaysList();
  if (typeof initOperatorBlockCalendar === 'function') {
    initOperatorBlockCalendar();
  }
}

function renderOperatorHomestaysList() {
  const tbody = document.getElementById('operatorUnitsTableBody');
  if (!tbody) return;

  const activeOp = getActiveOperator();
  const list = getHomestays();

  // Sort so the logged-in operator's own unit appears first
  const sorted = [...list].sort((a, b) => {
    if (a.id === activeOp.homestayId) return -1;
    if (b.id === activeOp.homestayId) return 1;
    return 0;
  });

  tbody.innerHTML = sorted
    .map((u) => {
      const isMine = u.id === activeOp.homestayId;
      return `
      <tr style="${isMine ? 'background-color: rgba(96, 108, 56, 0.12);' : 'opacity: 0.82;'}">
        <td data-label="Homestay Unit">
          <div class="d-flex align-items-center gap-2">
            <img src="${u.image}" alt="${u.name}" style="width: 54px; height: 40px; object-fit: cover; border-radius: 8px; border: 1.5px solid ${isMine ? 'var(--olive)' : 'var(--sand)'};">
            <div class="text-start">
              <div class="fw-bold d-flex align-items-center gap-2 flex-wrap">
                <span>${u.name}</span>
                ${
                  isMine
                    ? '<span class="badge-pill badge-approved py-0 px-2" style="font-size: 0.7rem;"><i class="fa-solid fa-user-check"></i> My Homestay</span>'
                    : ''
                }
              </div>
              <small style="color: var(--olive);">${u.shortDistrict} • Owner: <strong>${u.operatorName}</strong></small>
            </div>
          </div>
        </td>
        <td data-label="Max Capacity"><span class="badge-pill badge-pending">${u.maxGuests} Guests</span></td>
        <td data-label="Price / Night" class="fw-bold">RM ${Number(u.pricePerNight).toFixed(2)}</td>
        <td data-label="Blocked Dates">${u.blockedDates.length} date(s)</td>
        <td data-label="Ownership & Action">
          ${
            isMine
              ? `<button type="button" class="btn btn-olive btn-sm py-1 px-3" onclick="loadUnitForEdit('${u.id}', true)">
                   <i class="fa-solid fa-pen-to-square"></i> Edit My Homestay
                 </button>`
              : `<span class="badge-pill badge-blocked" title="Owned by ${u.operatorName}. You can only edit your own homestay.">
                   <i class="fa-solid fa-lock"></i> Locked (Owned by ${u.operatorName.split(' ')[0]} ${u.operatorName.split(' ')[1] || ''})
                 </span>`
          }
        </td>
      </tr>
    `;
    })
    .join('');
}

function loadUnitForEdit(unitId, scrollToForm = true) {
  const activeOp = getActiveOperator();
  const myUnit = getOperatorOwnedHomestay();

  // Strictly block editing any homestay that does not belong to the logged-in operator
  if (unitId !== activeOp.homestayId) {
    showPerdaToast(
      'Access Restricted',
      `You can only edit your own assigned homestay ("${myUnit.name}"). Other operators' homestays are read-only.`,
      'fa-lock'
    );
    return;
  }

  const unit = getHomestays().find((u) => u.id === unitId) || myUnit;
  if (!unit) return;

  const editIdEl = document.getElementById('unitEditId');
  if (editIdEl) editIdEl.value = unit.id;
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };
  setVal('unitNameInput', unit.name);
  setVal('unitDistrictInput', unit.shortDistrict);
  setVal('unitCapacityInput', unit.maxGuests);
  setVal('unitPriceInput', unit.pricePerNight);
  setVal('unitImageSelect', unit.image);
  setVal('unitDescInput', unit.description);

  const formTitle = document.getElementById('unitFormHeading');
  if (formTitle) {
    formTitle.innerHTML = `<i class="fa-solid fa-house-lock me-2" style="color: var(--olive);"></i> Edit My Assigned Homestay`;
  }

  if (scrollToForm) {
    document.getElementById('operatorHomestayForm')?.scrollIntoView({ behavior: 'smooth' });
  }
}

function resetOperatorUnitForm() {
  const myUnit = getOperatorOwnedHomestay();
  if (myUnit) {
    loadUnitForEdit(myUnit.id, false);
    showPerdaToast('Reverted Changes', `Form reset to saved details for "${myUnit.name}".`, 'fa-rotate-left');
  }
}

/**
 * ============================================================================
 * 5. PAGE 5: OPERATOR VERIFICATION & APPROVAL + 24-HOUR COUNTDOWN TIMERS
 * ============================================================================
 */
let activeVerificationRef = 'PERDA-2026-84920';
let pendingModalAction = null; // 'Approved' or 'Rejected'

function initVerificationPage() {
  const tableBody = document.getElementById('verificationTableBody');
  const statusFilter = document.getElementById('verificationStatusFilter');
  const searchInput = document.getElementById('verificationSearchInput');

  if (!tableBody) return;

  const refreshTable = () => {
    const filterVal = statusFilter ? statusFilter.value : 'ALL';
    const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
    const bookings = getBookings();

    const filtered = bookings.filter((b) => {
      const matchStatus = filterVal === 'ALL' || b.status.toLowerCase() === filterVal.toLowerCase();
      const matchQuery =
        !query ||
        b.ref.toLowerCase().includes(query) ||
        b.guestName.toLowerCase().includes(query) ||
        b.homestayName.toLowerCase().includes(query);
      return matchStatus && matchQuery;
    });

    // Update KPI counters
    const pendingCount = bookings.filter((b) => b.status === 'Pending').length;
    const pendingBadge = document.getElementById('pendingVerificationCount');
    if (pendingBadge) pendingBadge.textContent = pendingCount;
    const notifDot = document.getElementById('notifCountBadge');
    if (notifDot) notifDot.textContent = pendingCount;

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4">No bookings match the selected status filter.</td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filtered
      .map((b) => {
        let badgeCls = 'badge-pending';
        if (b.status === 'Approved') badgeCls = 'badge-approved';
        if (b.status === 'Rejected') badgeCls = 'badge-rejected';

        const isUrgent = b.status === 'Pending' && b.remainingSeconds > 0 && b.remainingSeconds < 18000;
        const timerHtml =
          b.status === 'Pending'
            ? `<span class="countdown-badge ${isUrgent ? 'urgent' : ''}" data-countdown-ref="${b.ref}">
                 <i class="fa-regular fa-clock"></i>
                 <span class="timer-digits">${formatSecondsHMS(b.remainingSeconds || 54000)}</span>
               </span>`
            : `<span class="small fw-semibold" style="color: var(--olive);"><i class="fa-solid fa-check-double"></i> Completed</span>`;

        return `
          <tr class="verification-row ${b.ref === activeVerificationRef ? 'selected-row' : ''}" onclick="selectBookingForVerification('${b.ref}')">
            <td data-label="Booking Ref" class="fw-bold">${b.ref}</td>
            <td data-label="Guest">${b.guestName}</td>
            <td data-label="Homestay">${b.homestayName}</td>
            <td data-label="Stay Dates">${b.checkIn} → ${b.checkOut}</td>
            <td data-label="Amount" class="fw-bold">RM ${Number(b.totalAmount).toFixed(2)}</td>
            <td data-label="24h SLA Timer">${timerHtml}</td>
            <td data-label="Status">
              <span class="badge-pill ${badgeCls}">${b.status}</span>
            </td>
          </tr>
        `;
      })
      .join('');
  };

  statusFilter?.addEventListener('change', refreshTable);
  searchInput?.addEventListener('input', refreshTable);

  refreshTable();
  selectBookingForVerification(getBookings()[0]?.ref || 'PERDA-2026-84920');

  // Start Live 1-Second Countdown Interval for 24-Hour SLA Timers
  setInterval(() => {
    const bookings = getBookings();
    let changed = false;
    bookings.forEach((b) => {
      if (b.status === 'Pending' && b.remainingSeconds > 0) {
        b.remainingSeconds--;
        changed = true;
      }
    });
    if (changed) {
      document.querySelectorAll('[data-countdown-ref]').forEach((el) => {
        const ref = el.getAttribute('data-countdown-ref');
        const match = bookings.find((x) => x.ref === ref);
        if (match) {
          const digits = el.querySelector('.timer-digits');
          if (digits) digits.textContent = formatSecondsHMS(match.remainingSeconds);
        }
      });
      const detailTimer = document.getElementById('detailCountdownTimerText');
      const activeBooking = bookings.find((x) => x.ref === activeVerificationRef);
      if (detailTimer && activeBooking) {
        detailTimer.textContent =
          activeBooking.status === 'Pending'
            ? `${formatSecondsHMS(activeBooking.remainingSeconds)} remaining`
            : `Verified (${activeBooking.status})`;
      }
    }
  }, 1000);

  // Confirmation Popup Modal Confirm Button
  const confirmActionBtn = document.getElementById('confirmDecisionModalBtn');
  if (confirmActionBtn) {
    confirmActionBtn.addEventListener('click', () => {
      if (!pendingModalAction || !activeVerificationRef) return;
      const bookings = getBookings();
      const target = bookings.find((b) => b.ref === activeVerificationRef);
      const notesInput = document.getElementById('decisionModalNotes');

      if (target) {
        target.status = pendingModalAction;
        target.remainingSeconds = 0;
        if (pendingModalAction === 'Rejected' && notesInput?.value.trim()) {
          target.rejectionReason = notesInput.value.trim();
        }
        saveBookings(bookings);
      }

      // Hide Bootstrap Modal
      const modalEl = document.getElementById('verifyDecisionModal');
      if (modalEl && window.bootstrap) {
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        bsModal?.hide();
      }

      refreshTable();
      selectBookingForVerification(activeVerificationRef);

      showPerdaToast(
        `Booking ${pendingModalAction}`,
        `Booking ${activeVerificationRef} has been marked as ${pendingModalAction}. Tourist notification email dispatched.`,
        pendingModalAction === 'Approved' ? 'fa-circle-check' : 'fa-circle-xmark'
      );
    });
  }
}

function formatSecondsHMS(totalSec) {
  const sec = Math.max(0, parseInt(totalSec, 10));
  const hrs = String(Math.floor(sec / 3600)).padStart(2, '0');
  const mins = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
  const secs = String(sec % 60).padStart(2, '0');
  return `${hrs}h : ${mins}m : ${secs}s`;
}

function selectBookingForVerification(refCode) {
  activeVerificationRef = refCode;
  const booking = getBookings().find((b) => b.ref === refCode);
  if (!booking) return;

  document.querySelectorAll('.verification-row').forEach((row) => {
    row.classList.toggle('selected-row', row.textContent.includes(refCode));
  });

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setTxt('detailVerifyRef', booking.ref);
  setTxt('detailVerifyGuest', booking.guestName);
  setTxt('detailVerifyContact', `${booking.guestPhone} • ${booking.guestEmail}`);
  setTxt('detailVerifyHomestay', `${booking.homestayName} (${booking.district})`);
  setTxt('detailVerifyDates', `${booking.checkIn} to ${booking.checkOut} (${booking.nights} Nights, ${booking.guests} Guests)`);
  setTxt('detailVerifyAmount', `RM ${Number(booking.totalAmount).toFixed(2)}`);
  setTxt('detailVerifyRequests', booking.specialRequests || 'None');
  setTxt('detailReceiptFilename', booking.receiptFile || 'duitnow_receipt.png');
  setTxt(
    'detailCountdownTimerText',
    booking.status === 'Pending'
      ? `${formatSecondsHMS(booking.remainingSeconds)} remaining`
      : `Completed (${booking.status})`
  );

  const badgeEl = document.getElementById('detailVerifyStatusBadge');
  if (badgeEl) {
    badgeEl.className = `badge-pill ${
      booking.status === 'Approved'
        ? 'badge-approved'
        : booking.status === 'Rejected'
        ? 'badge-rejected'
        : 'badge-pending'
    }`;
    badgeEl.textContent = booking.status;
  }
}

function openDecisionModal(decisionType) {
  pendingModalAction = decisionType;
  const booking = getBookings().find((b) => b.ref === activeVerificationRef);
  if (!booking) return;

  const titleEl = document.getElementById('decisionModalTitle');
  const descEl = document.getElementById('decisionModalDescription');
  const confirmBtn = document.getElementById('confirmDecisionModalBtn');
  const notesInput = document.getElementById('decisionModalNotes');

  if (notesInput) notesInput.value = '';

  if (decisionType === 'Approved') {
    if (titleEl) titleEl.textContent = `Approve Booking ${booking.ref}?`;
    if (descEl) {
      descEl.innerHTML = `You are confirming that payment of <strong>RM ${Number(booking.totalAmount).toFixed(2)}</strong> from <strong>${booking.guestName}</strong> for <strong>${booking.homestayName}</strong> has been verified.`;
    }
    if (confirmBtn) {
      confirmBtn.className = 'btn btn-olive';
      confirmBtn.innerHTML = '<i class="fa-solid fa-check"></i> Confirm Approval';
    }
  } else {
    if (titleEl) titleEl.textContent = `Reject Booking ${booking.ref}?`;
    if (descEl) {
      descEl.innerHTML = `Please confirm rejection for <strong>${booking.guestName}</strong> (${booking.ref}). Provide a reason below so the tourist can be notified.`;
    }
    if (confirmBtn) {
      confirmBtn.className = 'btn btn-cta';
      confirmBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> Confirm Rejection';
    }
  }

  const modalEl = document.getElementById('verifyDecisionModal');
  if (modalEl && window.bootstrap) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initTouristRegistrationForm();
  initBookingFormAndTracker();
  initInternalLoginPage();
  initDashboardPage();
  initVerificationPage();
});

