/**
 * ============================================================================
 * e-Homestay PERDA (Inap Desa) - Split-Screen Fluid Login Script (login.js)
 * Manages:
 *   1. Liquid SVG Path Morph + Translate Glide Animation (Right <-> Left)
 *      - Leading edge advances first; trailing edge lags with weight, then
 *        overshoots and wobbles to rest using a damped spring curve.
 *      - Duration ~1.05s; uses only transform & opacity for DOM motion.
 *   2. Choreographed Content Swap (fade/slide out on launch, delayed fade-in
 *      after panel has mostly arrived).
 *   3. Double-click lock while animation is running.
 *   4. URL Hash synchronization (#guest / #staff) for refresh & link sharing.
 *   5. Accessibility: respects prefers-reduced-motion with a quick crossfade.
 *   6. Show/Hide Password toggle & Tourist / Operator / @perda.gov.my validation.
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginStage = document.getElementById('loginStage');
  const welcomeContentInner = document.getElementById('welcomeContentInner');
  const fluidFormWrapper = document.getElementById('fluidFormWrapper');
  const fluidBodyPath = document.getElementById('fluidBodyPath');

  const sideSwitchBtn = document.getElementById('sideSwitchBtn');
  const welcomeModePill = document.getElementById('welcomeModePill');
  const welcomeHeading = document.getElementById('welcomeHeading');
  const welcomeSubtext = document.getElementById('welcomeSubtext');

  const formCardHeading = document.getElementById('formCardHeading');
  const formCardSubheading = document.getElementById('formCardSubheading');
  const belowCardPrompt = document.getElementById('belowCardPrompt');

  const staffRoleOperatorBtn = document.getElementById('staffRoleOperatorBtn');
  const staffRoleOfficerBtn = document.getElementById('staffRoleOfficerBtn');

  const loginForm = document.getElementById('splitLoginForm');
  const loginIdentityInput = document.getElementById('loginIdentityInput');
  const loginPasswordInput = document.getElementById('loginPasswordInput');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const loginFeedbackAlert = document.getElementById('loginFeedbackAlert');
  const loginFeedbackText = document.getElementById('loginFeedbackText');

  if (!loginStage || !loginForm) return;

  let isStaffMode = false;
  let isAnimating = false;
  let activeStaffSubRole = 'operator'; // 'operator' or 'officer'
  let activeRafId = null;

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * ==========================================================================
   * LIQUID SVG PATH MORPH DEFINITIONS (20-point coordinate vector)
   * Vector indices:
   *   Left Edge  [0..9]:  [L0x, L1cx1, L1cx2, L1x, L2cx1, L2cx2, L2x, L3cx1, L3cx2, L3x]
   *   Right Edge [10..19]:[R0x, R1cx1, R1cx2, R1x, R2cx1, R2cx2, R2x, R3cx1, R3cx2, R3x]
   * ==========================================================================
   */

  // Resting State 1: GUEST MODE (#guest) — Fluid sits on RIGHT
  // Left edge is an uneven hand-drawn organic wave; Right edge is sealed at x=1012
  const GUEST_REST_VEC = [
    75, 148, 22, 96, 158, 34, 112, 165, 42, 84,
    1012, 1012, 1012, 1012, 1012, 1012, 1012, 1012, 1012, 1012
  ];

  // Resting State 2: STAFF MODE (#staff) — Fluid sits on LEFT
  // Left edge is sealed at x=-12; Right edge is an uneven hand-drawn organic wave
  const STAFF_REST_VEC = [
    -12, -12, -12, -12, -12, -12, -12, -12, -12, -12,
    925, 852, 978, 904, 842, 966, 888, 835, 958, 916
  ];

  // Relative wave ripple weights along the vertical edge (top to bottom)
  // Gives uneven, organic, non-uniform deformation during surge and settle wobble
  const WAVE_WEIGHTS = [0.45, 1.15, 0.85, 1.05, 1.30, 0.90, 1.12, 1.22, 0.80, 0.50];

  function buildFluidPath(v) {
    return (
      `M${v[0].toFixed(1)},-8 ` +
      `C${v[1].toFixed(1)},105 ${v[2].toFixed(1)},215 ${v[3].toFixed(1)},330 ` +
      `C${v[4].toFixed(1)},425 ${v[5].toFixed(1)},540 ${v[6].toFixed(1)},665 ` +
      `C${v[7].toFixed(1)},760 ${v[8].toFixed(1)},880 ${v[9].toFixed(1)},1008 ` +
      `L${v[19].toFixed(1)},1008 ` +
      `C${v[18].toFixed(1)},880 ${v[17].toFixed(1)},760 ${v[16].toFixed(1)},665 ` +
      `C${v[15].toFixed(1)},540 ${v[14].toFixed(1)},425 ${v[13].toFixed(1)},330 ` +
      `C${v[12].toFixed(1)},215 ${v[11].toFixed(1)},105 ${v[10].toFixed(1)},-8 Z`
    );
  }

  // Easing equivalent to cubic-bezier(0.65, 0, 0.35, 1)
  function easeFluidGlide(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /**
   * Computes the 20-point SVG liquid path vector at normalized time t in [0, 1].
   * - Front edge leads early and bows outward in the direction of travel.
   * - Back edge lags slightly behind with heavy liquid drag, then overshoots
   *   and wobbles with a damped spring before coming to rest.
   */
  function computeLiquidMorphVector(t, toStaff) {
    const out = new Array(20);

    // Leading edge reaches destination faster; trailing edge lags behind
    const leadT = easeFluidGlide(Math.min(1, Math.pow(t, 0.68)));
    const trailT = easeFluidGlide(Math.pow(t, 1.38));

    // Outward bow impulse on the leading edge during the push (peaks around t = 0.32)
    const leadBowPhase = t < 0.68 ? Math.sin((t / 0.68) * Math.PI) : 0;

    // Trailing drag (first half) + damped elastic overshoot/wobble settle (second half)
    const dragImpulse = t < 0.52 ? Math.sin((t / 0.52) * Math.PI) : 0;
    const settlePhase = t > 0.38 ? (t - 0.38) / 0.62 : 0;
    // Damped spring: overshoots, recoils, and settles cleanly to 0 at t = 1
    const springWobble =
      settlePhase > 0
        ? Math.exp(-4.6 * settlePhase) *
          Math.sin(settlePhase * Math.PI * 2.8) *
          (1 - Math.pow(settlePhase, 3))
        : 0;

    if (toStaff) {
      // Gliding RIGHT -> LEFT (Guest -> Staff):
      // Front edge = Left edge [0..9] (leads leftwards, surges, then seals at -12)
      // Back edge  = Right edge [10..19] (lags rightwards, pulls in, overshoots & settles)
      for (let i = 0; i < 10; i++) {
        const baseL = lerp(GUEST_REST_VEC[i], STAFF_REST_VEC[i], leadT);
        const surgeLeft = -78 * leadBowPhase * WAVE_WEIGHTS[i] * (1 - leadT * 0.85);
        out[i] = baseL + surgeLeft;
      }
      for (let i = 0; i < 10; i++) {
        const idx = 10 + i;
        const baseR = lerp(GUEST_REST_VEC[idx], STAFF_REST_VEC[idx], trailT);
        // Early drag pulls trailing edge right (+), then springWobble sloshes (-/+) before rest
        const trailDrag = 62 * dragImpulse * WAVE_WEIGHTS[i];
        const wobbleOffset = -92 * springWobble * WAVE_WEIGHTS[9 - i];
        out[idx] = baseR + trailDrag + wobbleOffset;
      }
    } else {
      // Gliding LEFT -> RIGHT (Staff -> Guest):
      // Front edge = Right edge [10..19] (leads rightwards, surges, then seals at 1012)
      // Back edge  = Left edge [0..9] (lags leftwards, pulls in, overshoots & settles)
      for (let i = 0; i < 10; i++) {
        const idx = 10 + i;
        const baseR = lerp(STAFF_REST_VEC[idx], GUEST_REST_VEC[idx], leadT);
        const surgeRight = 78 * leadBowPhase * WAVE_WEIGHTS[i] * (1 - leadT * 0.85);
        out[idx] = baseR + surgeRight;
      }
      for (let i = 0; i < 10; i++) {
        const baseL = lerp(STAFF_REST_VEC[i], GUEST_REST_VEC[i], trailT);
        // Early drag holds trailing edge left (-), then springWobble sloshes (+/-) before rest
        const trailDrag = -62 * dragImpulse * WAVE_WEIGHTS[i];
        const wobbleOffset = 92 * springWobble * WAVE_WEIGHTS[9 - i];
        out[i] = baseL + trailDrag + wobbleOffset;
      }
    }

    return out;
  }

  /**
   * Updates only the text/inputs inside the Welcome Panel and Form Card
   */
  function applyModeContent(staffMode) {
    hideError();

    if (staffMode) {
      loginStage.classList.add('is-staff-content');
      loginStage.setAttribute('data-mode', 'staff');

      if (welcomeModePill) {
        welcomeModePill.innerHTML =
          '<i class="fa-solid fa-shield-halved" style="color: var(--burnt-orange);"></i> Staff &amp; Operator Access';
      }
      if (welcomeHeading) {
        welcomeHeading.textContent = 'PERDA Internal Management Portal';
      }
      if (welcomeSubtext) {
        welcomeSubtext.textContent =
          'Manage your assigned homestay unit, verify incoming bookings, and generate official district reports.';
      }
      if (sideSwitchBtn) {
        sideSwitchBtn.innerHTML = '&larr; Back to guest sign in';
      }
      if (formCardHeading) {
        formCardHeading.textContent = 'Staff Sign in';
      }
      if (formCardSubheading) {
        formCardSubheading.textContent =
          activeStaffSubRole === 'officer'
            ? 'Verified BPE PERDA Officer (@perda.gov.my)'
            : 'Registered PERDA Homestay Operator';
      }
      if (loginIdentityInput) {
        loginIdentityInput.placeholder =
          activeStaffSubRole === 'officer'
            ? 'officer.bpe@perda.gov.my'
            : 'operator@homestayperda.my';
        loginIdentityInput.value =
          activeStaffSubRole === 'officer'
            ? 'officer.bpe@perda.gov.my'
            : 'operator@homestayperda.my';
      }
      if (loginPasswordInput) {
        loginPasswordInput.value =
          activeStaffSubRole === 'officer' ? 'PerdaAdmin2026!' : 'Operator2026!';
      }
      if (belowCardPrompt) {
        belowCardPrompt.innerHTML =
          'Need a tourist account instead? <button type="button" id="switchBackGuestInlineBtn">Switch to guest sign in</button>';
        document
          .getElementById('switchBackGuestInlineBtn')
          ?.addEventListener('click', () => triggerModeSwitch(false, true));
      }
    } else {
      loginStage.classList.remove('is-staff-content');
      loginStage.setAttribute('data-mode', 'user');

      if (welcomeModePill) {
        welcomeModePill.innerHTML =
          '<i class="fa-solid fa-leaf" style="color: var(--olive);"></i> Official PERDA Inap Desa';
      }
      if (welcomeHeading) {
        welcomeHeading.textContent = 'Welcome to Kampung Serenity';
      }
      if (welcomeSubtext) {
        welcomeSubtext.textContent =
          'Discover and book authentic rural homestays across Penang’s peaceful villages.';
      }
      if (sideSwitchBtn) {
        sideSwitchBtn.innerHTML = 'Homestay operator or PERDA staff? Sign in here &rarr;';
      }
      if (formCardHeading) {
        formCardHeading.textContent = 'Sign in';
      }
      if (formCardSubheading) {
        formCardSubheading.textContent = 'to book your homestay';
      }
      if (loginIdentityInput) {
        loginIdentityInput.placeholder = 'Username or email address';
        loginIdentityInput.value = '';
      }
      if (loginPasswordInput) {
        loginPasswordInput.value = '';
      }
      if (belowCardPrompt) {
        belowCardPrompt.innerHTML =
          'New here? <button type="button" data-bs-toggle="modal" data-bs-target="#createAccountModal">Create an account</button>';
      }
    }
  }

  /**
   * Synchronizes the URL hash (#guest or #staff) without scrolling
   */
  function syncUrlHash(staffMode, replace = false) {
    const targetHash = staffMode ? '#staff' : '#guest';
    if (window.location.hash !== targetHash) {
      if (replace && window.history && window.history.replaceState) {
        window.history.replaceState(null, '', targetHash);
      } else if (window.history && window.history.pushState) {
        window.history.pushState(null, '', targetHash);
      } else {
        window.location.hash = targetHash;
      }
    }
  }

  /**
   * Sets initial state immediately on page load (no transition animation)
   */
  function setInitialLoginMode(staffMode) {
    isStaffMode = staffMode;
    loginStage.classList.toggle('is-staff-mode', staffMode);
    applyModeContent(staffMode);
    if (fluidBodyPath) {
      fluidBodyPath.setAttribute(
        'd',
        buildFluidPath(staffMode ? STAFF_REST_VEC : GUEST_REST_VEC)
      );
    }
    syncUrlHash(staffMode, true);
  }

  /**
   * Orchestrates the Full Fluid Glide + SVG Morph + Choreographed Content Swap
   */
  function triggerModeSwitch(targetStaffMode, updateHash = true) {
    // Block double-clicks or redundant switches while animation is running
    if (isAnimating || targetStaffMode === isStaffMode) return;

    isAnimating = true;
    isStaffMode = targetStaffMode;
    loginStage.classList.add('is-animating');

    if (updateHash) {
      syncUrlHash(targetStaffMode, false);
    }

    // Respect prefers-reduced-motion: perform a simple quick crossfade
    if (prefersReducedMotion()) {
      welcomeContentInner?.classList.add('is-exiting-left');
      fluidFormWrapper?.classList.add('is-exiting-left');

      setTimeout(() => {
        loginStage.classList.toggle('is-staff-mode', targetStaffMode);
        applyModeContent(targetStaffMode);
        if (fluidBodyPath) {
          fluidBodyPath.setAttribute(
            'd',
            buildFluidPath(targetStaffMode ? STAFF_REST_VEC : GUEST_REST_VEC)
          );
        }
        welcomeContentInner?.classList.remove('is-exiting-left');
        fluidFormWrapper?.classList.remove('is-exiting-left');
        loginStage.classList.remove('is-animating');
        isAnimating = false;
      }, 190);
      return;
    }

    // 1. Fade & slide out current content in the direction of panel travel
    const formExitClass = targetStaffMode ? 'is-exiting-left' : 'is-exiting-right';
    const welcomeExitClass = targetStaffMode ? 'is-exiting-right' : 'is-exiting-left';
    const formStageClass = targetStaffMode ? 'is-staging-right' : 'is-staging-left';
    const welcomeStageClass = targetStaffMode ? 'is-staging-left' : 'is-staging-right';

    fluidFormWrapper?.classList.add(formExitClass);
    welcomeContentInner?.classList.add(welcomeExitClass);

    // 2. Trigger GPU-accelerated panel translate across the screen
    loginStage.classList.toggle('is-staff-mode', targetStaffMode);

    // 3. Animate SVG Liquid Path Morph + Wobble Settle (duration: 1060ms)
    const MORPH_DURATION = 1060;
    const startTime = performance.now();

    if (activeRafId) cancelAnimationFrame(activeRafId);

    function stepLiquidMorph(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / MORPH_DURATION);
      const vec = computeLiquidMorphVector(progress, targetStaffMode);

      if (fluidBodyPath) {
        fluidBodyPath.setAttribute('d', buildFluidPath(vec));
      }

      if (progress < 1) {
        activeRafId = requestAnimationFrame(stepLiquidMorph);
      } else {
        // Ensure exact resting vector at completion
        if (fluidBodyPath) {
          fluidBodyPath.setAttribute(
            'd',
            buildFluidPath(targetStaffMode ? STAFF_REST_VEC : GUEST_REST_VEC)
          );
        }
        activeRafId = null;
      }
    }

    activeRafId = requestAnimationFrame(stepLiquidMorph);

    // 4. Mid-flight (240ms): swap DOM text while hidden & stage for entry
    setTimeout(() => {
      applyModeContent(targetStaffMode);
      fluidFormWrapper?.classList.remove(formExitClass);
      welcomeContentInner?.classList.remove(welcomeExitClass);
      fluidFormWrapper?.classList.add(formStageClass);
      welcomeContentInner?.classList.add(welcomeStageClass);
    }, 240);

    // 5. After panel has mostly arrived (~680ms total, i.e., ~250ms+ delay after content swap):
    //    Fade & slide in the new mode's content
    setTimeout(() => {
      // Force layout read of transform/opacity staging before removing class so transition runs
      void fluidFormWrapper?.offsetWidth;
      fluidFormWrapper?.classList.remove(formStageClass);
      welcomeContentInner?.classList.remove(welcomeStageClass);
    }, 680);

    // 6. Unlock interaction once glide & wobble settle complete (1080ms)
    setTimeout(() => {
      loginStage.classList.remove('is-animating');
      isAnimating = false;
    }, 1080);
  }

  /**
   * Toggle between Homestay Operator & BPE PERDA Officer inside Staff mode
   */
  function setStaffSubRole(role) {
    activeStaffSubRole = role;
    hideError();
    if (role === 'officer') {
      staffRoleOfficerBtn?.classList.add('active');
      staffRoleOperatorBtn?.classList.remove('active');
    } else {
      staffRoleOperatorBtn?.classList.add('active');
      staffRoleOfficerBtn?.classList.remove('active');
    }
    if (isStaffMode) {
      applyModeContent(true);
    }
  }

  sideSwitchBtn?.addEventListener('click', () => {
    triggerModeSwitch(!isStaffMode, true);
  });

  // Listen to browser Back/Forward hash changes (#guest <-> #staff)
  window.addEventListener('hashchange', () => {
    const hashWantsStaff = window.location.hash.toLowerCase() === '#staff';
    if (hashWantsStaff !== isStaffMode && !isAnimating) {
      triggerModeSwitch(hashWantsStaff, false);
    }
  });

  staffRoleOperatorBtn?.addEventListener('click', () => setStaffSubRole('operator'));
  staffRoleOfficerBtn?.addEventListener('click', () => setStaffSubRole('officer'));

  // Quick-fill helper for testing Staff credentials
  window.fillStaffDemoCredentials = (subRole, email, password) => {
    setStaffSubRole(subRole);
    if (loginIdentityInput) loginIdentityInput.value = email;
    if (loginPasswordInput) loginPasswordInput.value = password;
  };

  /**
   * Show / Hide Password Toggle
   */
  if (togglePasswordBtn && loginPasswordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const isHidden = loginPasswordInput.type === 'password';
      loginPasswordInput.type = isHidden ? 'text' : 'password';
      togglePasswordBtn.innerHTML = isHidden
        ? '<i class="fa-solid fa-eye-slash"></i>'
        : '<i class="fa-solid fa-eye"></i>';
      togglePasswordBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    });
  }

  function showError(msg) {
    if (loginFeedbackText) loginFeedbackText.innerHTML = msg;
    loginFeedbackAlert?.classList.add('show');
  }

  function hideError() {
    loginFeedbackAlert?.classList.remove('show');
  }

  /**
   * Handle Login Submission for both USER mode (#guest) and STAFF mode (#staff)
   */
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    hideError();

    const identity = (loginIdentityInput?.value || '').trim();
    const password = loginPasswordInput?.value || '';

    if (!identity || identity.length < 3) {
      showError('Please enter your username or email address.');
      return;
    }

    if (!password || password.length < 6) {
      showError('Please enter your password (minimum 6 characters).');
      return;
    }

    // 1. Default State: USER (Tourist) Mode
    if (!isStaffMode) {
      if (typeof showPerdaToast === 'function') {
        showPerdaToast(
          'Welcome Back!',
          `Signed in as ${identity}. Redirecting to your homestay booking page...`,
          'fa-circle-check'
        );
      }
      setTimeout(() => {
        window.location.href = 'booking.html';
      }, 850);
      return;
    }

    // 2. Staff State: ADMIN (BPE PERDA Officer) or HOMESTAY OPERATOR Mode
    const emailLower = identity.toLowerCase();

    if (activeStaffSubRole === 'officer') {
      // Strict check: Admin login only accepts registered and verified official @perda.gov.my emails
      if (!emailLower.endsWith('@perda.gov.my')) {
        showError(
          `Access Denied: <strong>"${identity}"</strong> is not an official PERDA email. Admin login only accepts registered and verified <code>@perda.gov.my</code> emails.`
        );
        return;
      }

      const verifiedOfficer =
        typeof VERIFIED_ADMIN_ACCOUNTS !== 'undefined'
          ? VERIFIED_ADMIN_ACCOUNTS.find((a) => a.email.toLowerCase() === emailLower && a.verified)
          : { name: 'BPE PERDA Officer', email: emailLower };

      if (!verifiedOfficer) {
        showError(
          `Unverified Administrator: <strong>"${identity}"</strong> is not registered or verified in the official BPE PERDA Officer directory.`
        );
        return;
      }

      try {
        localStorage.setItem('perda_active_role', 'officer');
      } catch (err) {}

      if (typeof showPerdaToast === 'function') {
        showPerdaToast(
          'Officer Login Verified',
          `Welcome, ${verifiedOfficer.name}. Redirecting to the Officer Dashboard...`,
          'fa-user-shield'
        );
      }
      setTimeout(() => {
        window.location.href = 'dashboard.html?role=officer';
      }, 850);
    } else {
      // Homestay Operator Check (1 Operator = 1 Homestay)
      const operatorAcc =
        typeof REGISTERED_OPERATOR_ACCOUNTS !== 'undefined'
          ? REGISTERED_OPERATOR_ACCOUNTS.find((op) => op.email.toLowerCase() === emailLower)
          : null;

      if (!operatorAcc) {
        showError(
          `Operator Not Found: No registered PERDA homestay operator matches <strong>"${identity}"</strong>. Try <code>operator@homestayperda.my</code>.`
        );
        return;
      }

      if (typeof setActiveOperatorByEmail === 'function') {
        setActiveOperatorByEmail(operatorAcc.email);
      }
      try {
        localStorage.setItem('perda_active_role', 'operator');
      } catch (err) {}

      if (typeof showPerdaToast === 'function') {
        showPerdaToast(
          'Operator Signed In',
          `Welcome, ${operatorAcc.name} (${operatorAcc.unitName})! Redirecting to your dashboard...`,
          'fa-house-user'
        );
      }
      setTimeout(() => {
        window.location.href = 'dashboard.html?role=operator';
      }, 850);
    }
  });

  /**
   * Handle Tourist "Create an account" Modal Form
   */
  const modalRegForm = document.getElementById('modalCreateAccountForm');
  if (modalRegForm) {
    modalRegForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('modalRegName')?.value.trim();
      const email = document.getElementById('modalRegEmail')?.value.trim();
      const pass = document.getElementById('modalRegPass')?.value || '';
      const feedback = document.getElementById('modalRegFeedback');

      if (!name || !email || pass.length < 8) {
        if (feedback) {
          feedback.innerHTML = `<div class="small fw-semibold mt-2" style="color: var(--burnt-orange);">Please complete all fields (password min. 8 characters).</div>`;
        }
        return;
      }

      if (feedback) {
        feedback.innerHTML = `<div class="p-2 rounded-3 small fw-semibold mt-2" style="background: var(--olive); color: var(--cream);"><i class="fa-solid fa-circle-check me-1"></i> Account created for ${name}! Signing you in...</div>`;
      }
      if (loginIdentityInput) loginIdentityInput.value = email;
      if (loginPasswordInput) loginPasswordInput.value = pass;

      setTimeout(() => {
        const modalEl = document.getElementById('createAccountModal');
        if (modalEl && window.bootstrap) {
          bootstrap.Modal.getInstance(modalEl)?.hide();
        }
        if (typeof showPerdaToast === 'function') {
          showPerdaToast('Account Created', `Welcome to e-Homestay PERDA, ${name}!`, 'fa-user-check');
        }
      }, 900);
    });
  }

  /**
   * Handle "Forgot password?" Modal Form
   */
  const forgotForm = document.getElementById('forgotPasswordForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('resetPasswordEmail')?.value.trim();
      const feedback = document.getElementById('forgotPasswordFeedback');
      if (!email || !email.includes('@')) {
        if (feedback) {
          feedback.innerHTML = `<div class="small fw-semibold mt-2" style="color: var(--burnt-orange);">Please enter a valid registered email address.</div>`;
        }
        return;
      }
      if (feedback) {
        feedback.innerHTML = `<div class="p-2 rounded-3 small fw-semibold mt-2" style="background: var(--olive); color: var(--cream);"><i class="fa-solid fa-paper-plane me-1"></i> Password reset link sent to ${email}.</div>`;
      }
    });
  }

  // Initialize from URL hash (#staff or default #guest)
  const initialHash = window.location.hash.toLowerCase();
  setInitialLoginMode(initialHash === '#staff');
});
