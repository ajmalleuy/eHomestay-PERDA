/**
 * ============================================================================
 * e-Homestay PERDA (Inap Desa) - Split-Screen Fluid Login & Register (login.js)
 * Manages:
 *   1. 3 User Types & 5 Forms:
 *      - Guest: Login + Register (optional, with "book without an account" note)
 *      - Staff -> Operator: Login + Register (shows pending approval notice)
 *      - Staff -> Admin: Login ONLY (no register tab or register link anywhere)
 *   2. Smooth Card Height Transition when switching Operator/Admin or Login/Register
 *      (without triggering the big fluid panel movement).
 *   3. Weighted Liquid SVG Path Morph + Translate Glide when switching Guest <-> Staff.
 *   4. Inline Field Validation (empty, invalid email, invalid phone, short password,
 *      mismatched passwords, unchecked terms), Button Loading State & Card Shake.
 *   5. Backend Endpoint Wiring (/login, /register-tourist) & Role Redirects:
 *      - Guest -> index.html (Landing Page)
 *      - Operator -> dashboard.html?role=operator
 *      - Admin -> dashboard.html?role=officer
 *   6. Keyboard Accessibility: proper tab order, Enter submits, auto-focus first
 *      input field after every switch.
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginStage = document.getElementById('loginStage');
  const welcomeContentInner = document.getElementById('welcomeContentInner');
  const fluidFormWrapper = document.getElementById('fluidFormWrapper');
  const loginFormCard = document.getElementById('loginFormCard');
  const cardDynamicViewport = document.getElementById('cardDynamicViewport');
  const fluidBodyPath = document.getElementById('fluidBodyPath');

  const sideSwitchBtn = document.getElementById('sideSwitchBtn');
  const welcomeModePill = document.getElementById('welcomeModePill');
  const welcomeHeading = document.getElementById('welcomeHeading');
  const welcomeSubtext = document.getElementById('welcomeSubtext');

  // Card Top Controls: Segmented Staff Toggle & Login/Register Tabs
  const staffSegmentedToggle = document.getElementById('staffSegmentedToggle');
  const staffRoleOperatorBtn = document.getElementById('staffRoleOperatorBtn');
  const staffRoleAdminBtn = document.getElementById('staffRoleAdminBtn');

  const authModeTabs = document.getElementById('authModeTabs');
  const tabBtnLogin = document.getElementById('tabBtnLogin');
  const tabBtnRegister = document.getElementById('tabBtnRegister');

  const formCardHeading = document.getElementById('formCardHeading');
  const formCardSubheading = document.getElementById('formCardSubheading');
  const belowCardPrompt = document.getElementById('belowCardPrompt');

  const loginFeedbackAlert = document.getElementById('loginFeedbackAlert');
  const loginFeedbackIcon = document.getElementById('loginFeedbackIcon');
  const loginFeedbackText = document.getElementById('loginFeedbackText');

  // 5 Form Panes
  const panes = {
    'guest-login': document.getElementById('guestLoginForm'),
    'guest-register': document.getElementById('guestRegisterForm'),
    'operator-login': document.getElementById('operatorLoginForm'),
    'operator-register': document.getElementById('operatorRegisterForm'),
    'admin-login': document.getElementById('adminLoginForm')
  };

  if (!loginStage || !loginFormCard) return;

  // State variables
  let isStaffMode = false;          // false = Guest (#guest), true = Staff (#staff)
  let activeStaffRole = 'operator'; // 'operator' or 'admin'
  let activeGuestTab = 'login';     // 'login' or 'register'
  let activeOperatorTab = 'login';  // 'login' or 'register'
  let isAnimating = false;
  let activeRafId = null;

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * ==========================================================================
   * 1. LIQUID SVG PATH MORPH DEFINITIONS (20-point coordinate vector)
   * ==========================================================================
   */
  const GUEST_REST_VEC = [
    75, 148, 22, 96, 158, 34, 112, 165, 42, 84,
    1012, 1012, 1012, 1012, 1012, 1012, 1012, 1012, 1012, 1012
  ];

  const STAFF_REST_VEC = [
    -12, -12, -12, -12, -12, -12, -12, -12, -12, -12,
    925, 852, 978, 904, 842, 966, 888, 835, 958, 916
  ];

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

  function easeFluidGlide(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function computeLiquidMorphVector(t, toStaff) {
    const out = new Array(20);
    const leadT = easeFluidGlide(Math.min(1, Math.pow(t, 0.68)));
    const trailT = easeFluidGlide(Math.pow(t, 1.38));
    const leadBowPhase = t < 0.68 ? Math.sin((t / 0.68) * Math.PI) : 0;
    const dragImpulse = t < 0.52 ? Math.sin((t / 0.52) * Math.PI) : 0;
    const settlePhase = t > 0.38 ? (t - 0.38) / 0.62 : 0;
    const springWobble =
      settlePhase > 0
        ? Math.exp(-4.6 * settlePhase) *
          Math.sin(settlePhase * Math.PI * 2.8) *
          (1 - Math.pow(settlePhase, 3))
        : 0;

    if (toStaff) {
      for (let i = 0; i < 10; i++) {
        const baseL = lerp(GUEST_REST_VEC[i], STAFF_REST_VEC[i], leadT);
        const surgeLeft = -78 * leadBowPhase * WAVE_WEIGHTS[i] * (1 - leadT * 0.85);
        out[i] = baseL + surgeLeft;
      }
      for (let i = 0; i < 10; i++) {
        const idx = 10 + i;
        const baseR = lerp(GUEST_REST_VEC[idx], STAFF_REST_VEC[idx], trailT);
        const trailDrag = 62 * dragImpulse * WAVE_WEIGHTS[i];
        const wobbleOffset = -92 * springWobble * WAVE_WEIGHTS[9 - i];
        out[idx] = baseR + trailDrag + wobbleOffset;
      }
    } else {
      for (let i = 0; i < 10; i++) {
        const idx = 10 + i;
        const baseR = lerp(STAFF_REST_VEC[idx], GUEST_REST_VEC[idx], leadT);
        const surgeRight = 78 * leadBowPhase * WAVE_WEIGHTS[i] * (1 - leadT * 0.85);
        out[idx] = baseR + surgeRight;
      }
      for (let i = 0; i < 10; i++) {
        const baseL = lerp(STAFF_REST_VEC[i], GUEST_REST_VEC[i], trailT);
        const trailDrag = -62 * dragImpulse * WAVE_WEIGHTS[i];
        const wobbleOffset = 92 * springWobble * WAVE_WEIGHTS[9 - i];
        out[i] = baseL + trailDrag + wobbleOffset;
      }
    }
    return out;
  }

  /**
   * ==========================================================================
   * 2. ACTIVE PANE RESOLUTION, SMOOTH CARD HEIGHT & FOCUS MANAGEMENT
   * ==========================================================================
   */
  function getTargetPaneKey() {
    if (!isStaffMode) {
      return activeGuestTab === 'register' ? 'guest-register' : 'guest-login';
    }
    if (activeStaffRole === 'admin') {
      return 'admin-login'; // Admin is strictly LOGIN ONLY
    }
    return activeOperatorTab === 'register' ? 'operator-register' : 'operator-login';
  }

  /**
   * Focuses the first visible input/select field inside the active form pane
   */
  function focusFirstActiveField() {
    const activeKey = getTargetPaneKey();
    const activePane = panes[activeKey];
    if (!activePane) return;
    const firstField = activePane.querySelector(
      'input:not([type="hidden"]):not(:disabled), select:not(:disabled)'
    );
    if (firstField) {
      firstField.focus({ preventScroll: true });
    }
  }

  /**
   * Updates Card Header, Segmented Toggle, Login/Register Tabs & Below-Card Link
   */
  function syncCardControlsUI() {
    const currentTab = !isStaffMode ? activeGuestTab : activeOperatorTab;

    // 1. Welcome Panel Content
    if (isStaffMode) {
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
    } else {
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
    }

    // 2. Staff Segmented Toggle ("Operator" | "Admin")
    if (staffSegmentedToggle) {
      staffSegmentedToggle.hidden = !isStaffMode;
      staffSegmentedToggle.classList.toggle('is-admin-selected', activeStaffRole === 'admin');
    }
    if (staffRoleOperatorBtn && staffRoleAdminBtn) {
      const isOp = activeStaffRole === 'operator';
      staffRoleOperatorBtn.classList.toggle('active', isOp);
      staffRoleOperatorBtn.setAttribute('aria-checked', String(isOp));
      staffRoleAdminBtn.classList.toggle('active', !isOp);
      staffRoleAdminBtn.setAttribute('aria-checked', String(!isOp));
    }

    // 3. Login / Register Tabs (Shown for Guest & Operator; HIDDEN for Admin)
    const showTabs = !isStaffMode || activeStaffRole === 'operator';
    if (authModeTabs) {
      authModeTabs.hidden = !showTabs;
    }
    if (tabBtnLogin && tabBtnRegister) {
      const isLoginTab = currentTab === 'login';
      tabBtnLogin.classList.toggle('active', isLoginTab);
      tabBtnLogin.setAttribute('aria-selected', String(isLoginTab));
      tabBtnRegister.classList.toggle('active', !isLoginTab);
      tabBtnRegister.setAttribute('aria-selected', String(!isLoginTab));
    }

    // 4. Card Heading, Subheading & Below-Card Prompt
    if (!isStaffMode) {
      if (activeGuestTab === 'register') {
        if (formCardHeading) formCardHeading.textContent = 'Create an account';
        if (formCardSubheading) formCardSubheading.textContent = 'for faster bookings & stay tracking';
        if (belowCardPrompt) {
          belowCardPrompt.hidden = false;
          belowCardPrompt.innerHTML =
            'Already have an account? <button type="button" id="belowCardSwitchTabBtn">Sign in here</button>';
        }
      } else {
        if (formCardHeading) formCardHeading.textContent = 'Sign in';
        if (formCardSubheading) formCardSubheading.textContent = 'to book your homestay';
        if (belowCardPrompt) {
          belowCardPrompt.hidden = false;
          belowCardPrompt.innerHTML =
            'New here? <button type="button" id="belowCardSwitchTabBtn">Create an account</button>';
        }
      }
    } else if (activeStaffRole === 'operator') {
      if (activeOperatorTab === 'register') {
        if (formCardHeading) formCardHeading.textContent = 'Operator Registration';
        if (formCardSubheading) formCardSubheading.textContent = 'Register your PERDA homestay unit';
        if (belowCardPrompt) {
          belowCardPrompt.hidden = false;
          belowCardPrompt.innerHTML =
            'Already registered? <button type="button" id="belowCardSwitchTabBtn">Operator login</button>';
        }
      } else {
        if (formCardHeading) formCardHeading.textContent = 'Operator Sign in';
        if (formCardSubheading) formCardSubheading.textContent = 'Manage your homestay & verify bookings';
        if (belowCardPrompt) {
          belowCardPrompt.hidden = false;
          belowCardPrompt.innerHTML =
            'New homestay owner? <button type="button" id="belowCardSwitchTabBtn">Register as operator</button>';
        }
      }
    } else {
      // Admin Mode: LOGIN ONLY — No register tab and no register link anywhere!
      if (formCardHeading) formCardHeading.textContent = 'Admin Sign in';
      if (formCardSubheading) {
        formCardSubheading.textContent = 'Internal BPE PERDA Officer Portal (@perda.gov.my)';
      }
      if (belowCardPrompt) {
        belowCardPrompt.hidden = true;
        belowCardPrompt.innerHTML = '';
      }
    }

    // Bind dynamic below-card switch button if present
    document.getElementById('belowCardSwitchTabBtn')?.addEventListener('click', () => {
      if (!isStaffMode) {
        switchCardInnerState({ guestTab: activeGuestTab === 'login' ? 'register' : 'login' });
      } else if (activeStaffRole === 'operator') {
        switchCardInnerState({ operatorTab: activeOperatorTab === 'login' ? 'register' : 'login' });
      }
    });
  }

  /**
   * Switches between Operator/Admin or Login/Register WITH a smooth card height
   * transition and WITHOUT triggering the big fluid panel movement.
   */
  function switchCardInnerState({ staffRole, guestTab, operatorTab }, animateHeight = true) {
    if (isAnimating) return;

    hideCardBanner();
    clearAllFieldErrors();

    const prevKey = getTargetPaneKey();
    if (staffRole !== undefined) activeStaffRole = staffRole;
    if (guestTab !== undefined) activeGuestTab = guestTab;
    if (operatorTab !== undefined) activeOperatorTab = operatorTab;
    const nextKey = getTargetPaneKey();

    syncCardControlsUI();

    if (prevKey === nextKey) {
      focusFirstActiveField();
      return;
    }

    const prevPane = panes[prevKey];
    const nextPane = panes[nextKey];
    if (!nextPane || !cardDynamicViewport) return;

    if (!animateHeight || prefersReducedMotion()) {
      Object.entries(panes).forEach(([k, p]) => {
        if (!p) return;
        p.hidden = k !== nextKey;
        p.classList.toggle('is-active-pane', k === nextKey);
      });
      cardDynamicViewport.style.height = '';
      focusFirstActiveField();
      return;
    }

    // 1. Measure current viewport height before switching panes
    const startHeight = cardDynamicViewport.offsetHeight;
    cardDynamicViewport.style.height = `${startHeight}px`;

    // 2. Swap active pane & stage subtle fade-in
    if (prevPane) {
      prevPane.hidden = true;
      prevPane.classList.remove('is-active-pane');
    }
    nextPane.hidden = false;
    nextPane.classList.add('is-active-pane', 'is-pane-entering');

    // 3. Measure target height and animate smoothly
    const targetHeight = nextPane.offsetHeight;
    void cardDynamicViewport.offsetHeight; // force reflow
    cardDynamicViewport.style.height = `${targetHeight}px`;

    requestAnimationFrame(() => {
      nextPane.classList.remove('is-pane-entering');
    });

    setTimeout(() => {
      cardDynamicViewport.style.height = '';
      focusFirstActiveField();
    }, 330);
  }

  /**
   * ==========================================================================
   * 3. GUEST <-> STAFF BIG FLUID PANEL GLIDE & CHOREOGRAPHED SWAP
   * ==========================================================================
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

  function setInitialLoginMode(staffMode) {
    isStaffMode = staffMode;
    loginStage.classList.toggle('is-staff-mode', staffMode);
    syncCardControlsUI();

    const activeKey = getTargetPaneKey();
    Object.entries(panes).forEach(([k, p]) => {
      if (!p) return;
      p.hidden = k !== activeKey;
      p.classList.toggle('is-active-pane', k === activeKey);
    });

    if (fluidBodyPath) {
      fluidBodyPath.setAttribute(
        'd',
        buildFluidPath(staffMode ? STAFF_REST_VEC : GUEST_REST_VEC)
      );
    }
    syncUrlHash(staffMode, true);
    focusFirstActiveField();
  }

  function triggerModeSwitch(targetStaffMode, updateHash = true) {
    if (isAnimating || targetStaffMode === isStaffMode) return;

    isAnimating = true;
    isStaffMode = targetStaffMode;
    loginStage.classList.add('is-animating');
    hideCardBanner();
    clearAllFieldErrors();

    if (updateHash) {
      syncUrlHash(targetStaffMode, false);
    }

    // Reduced-motion fallback: simple quick crossfade
    if (prefersReducedMotion()) {
      welcomeContentInner?.classList.add('is-exiting-left');
      fluidFormWrapper?.classList.add('is-exiting-left');

      setTimeout(() => {
        loginStage.classList.toggle('is-staff-mode', targetStaffMode);
        syncCardControlsUI();
        const nextKey = getTargetPaneKey();
        Object.entries(panes).forEach(([k, p]) => {
          if (p) p.hidden = k !== nextKey;
        });
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
        focusFirstActiveField();
      }, 190);
      return;
    }

    // 1. Fade & slide out current content
    const formExitClass = targetStaffMode ? 'is-exiting-left' : 'is-exiting-right';
    const welcomeExitClass = targetStaffMode ? 'is-exiting-right' : 'is-exiting-left';
    const formStageClass = targetStaffMode ? 'is-staging-right' : 'is-staging-left';
    const welcomeStageClass = targetStaffMode ? 'is-staging-left' : 'is-staging-right';

    fluidFormWrapper?.classList.add(formExitClass);
    welcomeContentInner?.classList.add(welcomeExitClass);

    // 2. Trigger GPU-accelerated panel translate across the screen
    loginStage.classList.toggle('is-staff-mode', targetStaffMode);

    // 3. Animate SVG Liquid Path Morph + Wobble Settle (1060ms)
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

    // 4. Mid-flight (240ms): swap card & welcome content while hidden
    setTimeout(() => {
      syncCardControlsUI();
      const nextKey = getTargetPaneKey();
      Object.entries(panes).forEach(([k, p]) => {
        if (!p) return;
        p.hidden = k !== nextKey;
        p.classList.toggle('is-active-pane', k === nextKey);
      });
      if (cardDynamicViewport) cardDynamicViewport.style.height = '';

      fluidFormWrapper?.classList.remove(formExitClass);
      welcomeContentInner?.classList.remove(welcomeExitClass);
      fluidFormWrapper?.classList.add(formStageClass);
      welcomeContentInner?.classList.add(welcomeStageClass);
    }, 240);

    // 5. Delayed fade-in after panel has mostly arrived (680ms)
    setTimeout(() => {
      void fluidFormWrapper?.offsetWidth;
      fluidFormWrapper?.classList.remove(formStageClass);
      welcomeContentInner?.classList.remove(welcomeStageClass);
    }, 680);

    // 6. Unlock & focus first field once fluid settles (1080ms)
    setTimeout(() => {
      loginStage.classList.remove('is-animating');
      isAnimating = false;
      focusFirstActiveField();
    }, 1080);
  }

  // Event listeners for mode, segmented role toggle, and tabs
  sideSwitchBtn?.addEventListener('click', () => {
    triggerModeSwitch(!isStaffMode, true);
  });

  window.addEventListener('hashchange', () => {
    const hashWantsStaff = window.location.hash.toLowerCase() === '#staff';
    if (hashWantsStaff !== isStaffMode && !isAnimating) {
      triggerModeSwitch(hashWantsStaff, false);
    }
  });

  staffRoleOperatorBtn?.addEventListener('click', () => {
    if (activeStaffRole !== 'operator') {
      switchCardInnerState({ staffRole: 'operator' }, true);
    }
  });

  staffRoleAdminBtn?.addEventListener('click', () => {
    if (activeStaffRole !== 'admin') {
      switchCardInnerState({ staffRole: 'admin' }, true);
    }
  });

  tabBtnLogin?.addEventListener('click', () => {
    if (!isStaffMode && activeGuestTab !== 'login') {
      switchCardInnerState({ guestTab: 'login' }, true);
    } else if (isStaffMode && activeStaffRole === 'operator' && activeOperatorTab !== 'login') {
      switchCardInnerState({ operatorTab: 'login' }, true);
    }
  });

  tabBtnRegister?.addEventListener('click', () => {
    if (!isStaffMode && activeGuestTab !== 'register') {
      switchCardInnerState({ guestTab: 'register' }, true);
    } else if (isStaffMode && activeStaffRole === 'operator' && activeOperatorTab !== 'register') {
      switchCardInnerState({ operatorTab: 'register' }, true);
    }
  });

  /**
   * ==========================================================================
   * 4. SHOW / HIDE PASSWORD TOGGLES (All Password Fields)
   * ==========================================================================
   */
  document.querySelectorAll('.pill-password-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = targetId ? document.getElementById(targetId) : null;
      if (!input) return;
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      btn.innerHTML = isHidden
        ? '<i class="fa-solid fa-eye-slash"></i>'
        : '<i class="fa-solid fa-eye"></i>';
      btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    });
  });

  /**
   * ==========================================================================
   * 5. INLINE VALIDATION HELPERS, CARD SHAKE & LOADING STATE
   * ==========================================================================
   */
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_REGEX = /^[0-9+\-\s()]{8,16}$/;

  function setFieldError(inputEl, errorElId, message) {
    const errEl = document.getElementById(errorElId);
    if (inputEl) {
      inputEl.classList.toggle('is-invalid-pill', Boolean(message));
      inputEl.setAttribute('aria-invalid', message ? 'true' : 'false');
    }
    if (errEl) {
      errEl.textContent = message || '';
      errEl.classList.toggle('show', Boolean(message));
    }
  }

  function clearAllFieldErrors() {
    document.querySelectorAll('.pill-input-control.is-invalid-pill').forEach((el) => {
      el.classList.remove('is-invalid-pill');
      el.removeAttribute('aria-invalid');
    });
    document.querySelectorAll('.field-error-msg.show').forEach((el) => {
      el.textContent = '';
      el.classList.remove('show');
    });
  }

  // Clear individual inline error as soon as the user types or changes a field
  document.querySelectorAll('.auth-form-pane input, .auth-form-pane select').forEach((input) => {
    const clearHandler = () => {
      input.classList.remove('is-invalid-pill');
      input.removeAttribute('aria-invalid');
      const block = input.closest('.field-block');
      const errEl = block?.querySelector('.field-error-msg');
      if (errEl) {
        errEl.textContent = '';
        errEl.classList.remove('show');
      }
    };
    input.addEventListener('input', clearHandler);
    input.addEventListener('change', clearHandler);
  });

  function showCardBanner(message, isSuccess = false) {
    if (!loginFeedbackAlert || !loginFeedbackText) return;
    loginFeedbackAlert.classList.toggle('is-success-banner', isSuccess);
    if (loginFeedbackIcon) {
      loginFeedbackIcon.className = isSuccess
        ? 'fa-solid fa-circle-check mt-1'
        : 'fa-solid fa-triangle-exclamation mt-1';
    }
    loginFeedbackText.innerHTML = message;
    loginFeedbackAlert.classList.add('show');
  }

  function hideCardBanner() {
    loginFeedbackAlert?.classList.remove('show', 'is-success-banner');
  }

  function triggerCardShake() {
    if (!loginFormCard) return;
    loginFormCard.classList.remove('is-shaking');
    void loginFormCard.offsetWidth; // restart keyframe animation
    loginFormCard.classList.add('is-shaking');
  }

  function setButtonLoading(formEl, isLoading, loadingText = 'Submitting...') {
    const btn = formEl?.querySelector('button[type="submit"]');
    if (!btn) return;
    if (isLoading) {
      btn.dataset.originalHtml = btn.innerHTML;
      btn.disabled = true;
      btn.classList.add('is-loading');
      btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> <span>${loadingText}</span>`;
    } else {
      btn.disabled = false;
      btn.classList.remove('is-loading');
      if (btn.dataset.originalHtml) {
        btn.innerHTML = btn.dataset.originalHtml;
      }
    }
  }

  /**
   * Helper to post to existing backend endpoint (/login or /register-tourist)
   * when served over HTTP/HTTPS with a live backend, while falling back cleanly
   * in standalone local mode.
   */
  async function tryPostBackendEndpoint(endpoint, formDataObj) {
    if (!window.location.protocol.startsWith('http')) {
      return { handledByServer: false };
    }
    try {
      const body = new URLSearchParams(formDataObj);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: body.toString()
      });
      if (res.redirected && res.url) {
        return { handledByServer: true, redirectUrl: res.url };
      }
    } catch (err) {
      // Static server or offline mode: continue with client-side handler
    }
    return { handledByServer: false };
  }

  /**
   * ==========================================================================
   * 6. FORM 1: GUEST LOGIN (#guestLoginForm -> Redirects to Landing Page)
   * ==========================================================================
   */
  panes['guest-login']?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideCardBanner();

    const identityEl = document.getElementById('guestLoginIdentity');
    const passwordEl = document.getElementById('guestLoginPassword');
    const identity = (identityEl?.value || '').trim();
    const password = passwordEl?.value || '';

    let hasError = false;
    if (!identity) {
      setFieldError(identityEl, 'guestLoginIdentityError', 'Please enter your email or username.');
      hasError = true;
    } else if (identity.includes('@') && !EMAIL_REGEX.test(identity)) {
      setFieldError(identityEl, 'guestLoginIdentityError', 'Please enter a valid email address.');
      hasError = true;
    }

    if (!password) {
      setFieldError(passwordEl, 'guestLoginPasswordError', 'Please enter your password.');
      hasError = true;
    } else if (password.length < 6) {
      setFieldError(
        passwordEl,
        'guestLoginPasswordError',
        'Password is too short (minimum 6 characters).'
      );
      hasError = true;
    }

    if (hasError) {
      triggerCardShake();
      return;
    }

    setButtonLoading(panes['guest-login'], true, 'Signing in...');
    await new Promise((r) => setTimeout(r, 650));

    // Check if guest registered a local account with a specific password
    let storedGuests = [];
    try {
      storedGuests = JSON.parse(localStorage.getItem('perda_registered_guests') || '[]');
    } catch (err) {}

    const matchedGuest = storedGuests.find(
      (g) =>
        g.email.toLowerCase() === identity.toLowerCase() ||
        g.name.toLowerCase() === identity.toLowerCase()
    );

    if (matchedGuest && matchedGuest.password !== password) {
      setButtonLoading(panes['guest-login'], false);
      showCardBanner('Incorrect email/username or password. Please check your credentials.');
      triggerCardShake();
      return;
    }

    // Demo wrong-password check if user types "wrong"
    if (password.toLowerCase() === 'wrongpass') {
      setButtonLoading(panes['guest-login'], false);
      showCardBanner('Invalid credentials: The username or password you entered is incorrect.');
      triggerCardShake();
      return;
    }

    await tryPostBackendEndpoint('/login', {
      email: identity,
      password,
      login_role: 'tourist'
    });

    try {
      localStorage.setItem('perda_active_role', 'tourist');
      localStorage.setItem('perda_guest_user', matchedGuest ? matchedGuest.name : identity);
    } catch (err) {}

    if (typeof showPerdaToast === 'function') {
      showPerdaToast(
        'Signed In Successfully',
        `Welcome back! Redirecting to the e-Homestay landing page...`,
        'fa-circle-check'
      );
    }

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 650);
  });

  /**
   * ==========================================================================
   * 7. FORM 2: GUEST REGISTER (#guestRegisterForm -> /register-tourist -> Landing Page)
   * ==========================================================================
   */
  panes['guest-register']?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideCardBanner();

    const nameEl = document.getElementById('guestRegName');
    const emailEl = document.getElementById('guestRegEmail');
    const phoneEl = document.getElementById('guestRegPhone');
    const passEl = document.getElementById('guestRegPassword');
    const confirmEl = document.getElementById('guestRegConfirmPassword');
    const termsEl = document.getElementById('guestRegTerms');

    const name = (nameEl?.value || '').trim();
    const email = (emailEl?.value || '').trim();
    const phone = (phoneEl?.value || '').trim();
    const pass = passEl?.value || '';
    const confirm = confirmEl?.value || '';
    const termsChecked = Boolean(termsEl?.checked);

    let hasError = false;

    if (!name) {
      setFieldError(nameEl, 'guestRegNameError', 'Please enter your full name.');
      hasError = true;
    }
    if (!email) {
      setFieldError(emailEl, 'guestRegEmailError', 'Please enter your email address.');
      hasError = true;
    } else if (!EMAIL_REGEX.test(email)) {
      setFieldError(emailEl, 'guestRegEmailError', 'Please enter a valid email address.');
      hasError = true;
    }
    if (!phone) {
      setFieldError(phoneEl, 'guestRegPhoneError', 'Please enter your phone number.');
      hasError = true;
    } else if (!PHONE_REGEX.test(phone)) {
      setFieldError(phoneEl, 'guestRegPhoneError', 'Please enter a valid phone number.');
      hasError = true;
    }
    if (!pass) {
      setFieldError(passEl, 'guestRegPasswordError', 'Please create a password.');
      hasError = true;
    } else if (pass.length < 8) {
      setFieldError(passEl, 'guestRegPasswordError', 'Password must be at least 8 characters.');
      hasError = true;
    }
    if (!confirm) {
      setFieldError(confirmEl, 'guestRegConfirmPasswordError', 'Please confirm your password.');
      hasError = true;
    } else if (pass && confirm !== pass) {
      setFieldError(confirmEl, 'guestRegConfirmPasswordError', 'Passwords do not match.');
      hasError = true;
    }
    if (!termsChecked) {
      setFieldError(
        termsEl,
        'guestRegTermsError',
        'Please accept the terms & conditions to register.'
      );
      hasError = true;
    }

    if (hasError) {
      triggerCardShake();
      return;
    }

    setButtonLoading(panes['guest-register'], true, 'Creating account...');
    await new Promise((r) => setTimeout(r, 700));

    await tryPostBackendEndpoint('/register-tourist', {
      name,
      email,
      phone,
      password: pass,
      password_confirmation: confirm,
      promotional_opt_in: '1'
    });

    try {
      const storedGuests = JSON.parse(localStorage.getItem('perda_registered_guests') || '[]');
      storedGuests.push({ name, email, phone, password: pass });
      localStorage.setItem('perda_registered_guests', JSON.stringify(storedGuests));
      localStorage.setItem('perda_active_role', 'tourist');
      localStorage.setItem('perda_guest_user', name);
    } catch (err) {}

    if (typeof showPerdaToast === 'function') {
      showPerdaToast(
        'Tourist Account Created',
        `Welcome, ${name}! Redirecting to the landing page...`,
        'fa-user-check'
      );
    }

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 700);
  });

  /**
   * ==========================================================================
   * 8. FORM 3: OPERATOR LOGIN (#operatorLoginForm -> Operator Dashboard)
   * ==========================================================================
   */
  window.fillOperatorDemo = (email, password) => {
    const idEl = document.getElementById('operatorLoginIdentity');
    const pwEl = document.getElementById('operatorLoginPassword');
    if (idEl) idEl.value = email;
    if (pwEl) pwEl.value = password;
    clearAllFieldErrors();
    hideCardBanner();
  };

  panes['operator-login']?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideCardBanner();

    const identityEl = document.getElementById('operatorLoginIdentity');
    const passwordEl = document.getElementById('operatorLoginPassword');
    const identity = (identityEl?.value || '').trim();
    const password = passwordEl?.value || '';

    let hasError = false;
    if (!identity) {
      setFieldError(
        identityEl,
        'operatorLoginIdentityError',
        'Please enter your operator email or username.'
      );
      hasError = true;
    } else if (identity.includes('@') && !EMAIL_REGEX.test(identity)) {
      setFieldError(
        identityEl,
        'operatorLoginIdentityError',
        'Please enter a valid operator email address.'
      );
      hasError = true;
    }

    if (!password) {
      setFieldError(passwordEl, 'operatorLoginPasswordError', 'Please enter your password.');
      hasError = true;
    } else if (password.length < 6) {
      setFieldError(
        passwordEl,
        'operatorLoginPasswordError',
        'Password is too short (minimum 6 characters).'
      );
      hasError = true;
    }

    if (hasError) {
      triggerCardShake();
      return;
    }

    setButtonLoading(panes['operator-login'], true, 'Verifying operator...');
    await new Promise((r) => setTimeout(r, 650));

    const identityLower = identity.toLowerCase();
    const operatorAcc =
      typeof REGISTERED_OPERATOR_ACCOUNTS !== 'undefined'
        ? REGISTERED_OPERATOR_ACCOUNTS.find(
            (op) =>
              op.email.toLowerCase() === identityLower ||
              op.name.toLowerCase() === identityLower
          )
        : null;

    if (!operatorAcc || password !== 'Operator2026!') {
      setButtonLoading(panes['operator-login'], false);
      showCardBanner(
        !operatorAcc
          ? `No registered PERDA operator found for <strong>"${identity}"</strong>. Try <code>operator@homestayperda.my</code>.`
          : 'Incorrect password for this operator account. (Demo password: <code>Operator2026!</code>)'
      );
      triggerCardShake();
      return;
    }

    await tryPostBackendEndpoint('/login', {
      email: operatorAcc.email,
      password,
      login_role: 'operator'
    });

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
    }, 650);
  });

  /**
   * ==========================================================================
   * 9. FORM 4: OPERATOR REGISTER (#operatorRegisterForm -> Review Message)
   * ==========================================================================
   */
  panes['operator-register']?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideCardBanner();

    const ownerEl = document.getElementById('opRegOwnerName');
    const homestayEl = document.getElementById('opRegHomestayName');
    const districtEl = document.getElementById('opRegDistrict');
    const phoneEl = document.getElementById('opRegPhone');
    const emailEl = document.getElementById('opRegEmail');
    const passEl = document.getElementById('opRegPassword');
    const confirmEl = document.getElementById('opRegConfirmPassword');

    const owner = (ownerEl?.value || '').trim();
    const homestay = (homestayEl?.value || '').trim();
    const district = (districtEl?.value || '').trim();
    const phone = (phoneEl?.value || '').trim();
    const email = (emailEl?.value || '').trim();
    const pass = passEl?.value || '';
    const confirm = confirmEl?.value || '';

    let hasError = false;

    if (!owner) {
      setFieldError(ownerEl, 'opRegOwnerNameError', 'Please enter the owner full name.');
      hasError = true;
    }
    if (!homestay) {
      setFieldError(homestayEl, 'opRegHomestayNameError', 'Please enter your homestay name.');
      hasError = true;
    }
    if (!district) {
      setFieldError(districtEl, 'opRegDistrictError', 'Please select a district.');
      hasError = true;
    }
    if (!phone) {
      setFieldError(phoneEl, 'opRegPhoneError', 'Phone number is required.');
      hasError = true;
    } else if (!PHONE_REGEX.test(phone)) {
      setFieldError(phoneEl, 'opRegPhoneError', 'Enter a valid phone number.');
      hasError = true;
    }
    if (!email) {
      setFieldError(emailEl, 'opRegEmailError', 'Email address is required.');
      hasError = true;
    } else if (!EMAIL_REGEX.test(email)) {
      setFieldError(emailEl, 'opRegEmailError', 'Please enter a valid email address.');
      hasError = true;
    }
    if (!pass) {
      setFieldError(passEl, 'opRegPasswordError', 'Please create a password.');
      hasError = true;
    } else if (pass.length < 8) {
      setFieldError(passEl, 'opRegPasswordError', 'Password must be at least 8 characters.');
      hasError = true;
    }
    if (!confirm) {
      setFieldError(confirmEl, 'opRegConfirmPasswordError', 'Please confirm your password.');
      hasError = true;
    } else if (pass && confirm !== pass) {
      setFieldError(confirmEl, 'opRegConfirmPasswordError', 'Passwords do not match.');
      hasError = true;
    }

    if (hasError) {
      triggerCardShake();
      return;
    }

    setButtonLoading(panes['operator-register'], true, 'Submitting application...');
    await new Promise((r) => setTimeout(r, 700));
    setButtonLoading(panes['operator-register'], false);

    panes['operator-register'].reset();

    // Show required pending-approval message on the card
    showCardBanner(
      '<strong>Application Received:</strong> Your account will be reviewed and approved before you can log in.',
      true
    );

    if (typeof showPerdaToast === 'function') {
      showPerdaToast(
        'Operator Registration Submitted',
        'Your account will be reviewed and approved before you can log in.',
        'fa-clipboard-check'
      );
    }
  });

  /**
   * ==========================================================================
   * 10. FORM 5: ADMIN LOGIN ONLY (#adminLoginForm -> Admin Dashboard)
   * ==========================================================================
   */
  window.fillAdminDemo = (email, password) => {
    const idEl = document.getElementById('adminLoginIdentity');
    const pwEl = document.getElementById('adminLoginPassword');
    if (idEl) idEl.value = email;
    if (pwEl) pwEl.value = password;
    clearAllFieldErrors();
    hideCardBanner();
  };

  panes['admin-login']?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideCardBanner();

    const identityEl = document.getElementById('adminLoginIdentity');
    const passwordEl = document.getElementById('adminLoginPassword');
    const identity = (identityEl?.value || '').trim();
    const password = passwordEl?.value || '';

    let hasError = false;
    if (!identity) {
      setFieldError(
        identityEl,
        'adminLoginIdentityError',
        'Please enter your official PERDA administrator email.'
      );
      hasError = true;
    } else if (!EMAIL_REGEX.test(identity)) {
      setFieldError(
        identityEl,
        'adminLoginIdentityError',
        'Please enter a valid email address (e.g. officer.bpe@perda.gov.my).'
      );
      hasError = true;
    }

    if (!password) {
      setFieldError(passwordEl, 'adminLoginPasswordError', 'Please enter your password.');
      hasError = true;
    } else if (password.length < 6) {
      setFieldError(
        passwordEl,
        'adminLoginPasswordError',
        'Password is too short (minimum 6 characters).'
      );
      hasError = true;
    }

    if (hasError) {
      triggerCardShake();
      return;
    }

    setButtonLoading(panes['admin-login'], true, 'Verifying admin...');
    await new Promise((r) => setTimeout(r, 650));

    const emailLower = identity.toLowerCase();
    if (!emailLower.endsWith('@perda.gov.my')) {
      setButtonLoading(panes['admin-login'], false);
      showCardBanner(
        `Access Denied: <strong>"${identity}"</strong> is not an official PERDA email. Admin login only accepts verified <code>@perda.gov.my</code> accounts.`
      );
      triggerCardShake();
      return;
    }

    const verifiedOfficer =
      typeof VERIFIED_ADMIN_ACCOUNTS !== 'undefined'
        ? VERIFIED_ADMIN_ACCOUNTS.find((a) => a.email.toLowerCase() === emailLower && a.verified)
        : { name: 'BPE PERDA Officer', email: emailLower };

    if (!verifiedOfficer || password !== 'PerdaAdmin2026!') {
      setButtonLoading(panes['admin-login'], false);
      showCardBanner(
        !verifiedOfficer
          ? `Unverified Administrator: <strong>"${identity}"</strong> is not registered in the official BPE PERDA Officer directory.`
          : 'Invalid administrator password. Please check your credentials and try again.'
      );
      triggerCardShake();
      return;
    }

    await tryPostBackendEndpoint('/login', {
      email: verifiedOfficer.email,
      password,
      login_role: 'officer'
    });

    try {
      localStorage.setItem('perda_active_role', 'officer');
    } catch (err) {}

    if (typeof showPerdaToast === 'function') {
      showPerdaToast(
        'Admin Login Verified',
        `Welcome, ${verifiedOfficer.name}. Redirecting to the Admin Dashboard...`,
        'fa-user-shield'
      );
    }

    setTimeout(() => {
      window.location.href = 'dashboard.html?role=officer';
    }, 650);
  });

  /**
   * ==========================================================================
   * 11. "Forgot password?" Modal Form
   * ==========================================================================
   */
  const forgotForm = document.getElementById('forgotPasswordForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('resetPasswordEmail')?.value.trim();
      const feedback = document.getElementById('forgotPasswordFeedback');
      if (!email || !EMAIL_REGEX.test(email)) {
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
