/**
 * ============================================================================
 * e-Homestay PERDA (Inap Desa) - Login & Registration Controller (login.js)
 * ============================================================================
 * HOW TO ADJUST ANIMATION SPEED & CURVE SHAPE:
 *   Edit the ANIMATION_CONFIG object right below:
 *   - MORPH_DURATION_MS:       Total duration of the SVG wave morph (default: 1050ms)
 *   - CONTENT_SWAP_DELAY_MS:   When hidden text/form swaps mid-flight (default: 240ms)
 *   - CONTENT_FADE_IN_MS:      When new content fades in after arrival (default: 660ms)
 *   - LEAD_BOW_STRENGTH:       How far the leading liquid edge bulges ahead (px in 0..1000 viewBox)
 *   - TRAIL_DRAG_STRENGTH:     How much the back edge lags behind at launch
 *   - SPRING_WOBBLE_STRENGTH:  Amplitude of the arrival overshoot & settle wobble
 *   - SPRING_DAMPING:          Higher = settles faster; Lower = more elastic bounces
 *   - SPRING_FREQUENCY:        Number of wobble oscillations during settle
 *   - GUEST_REST_VEC / STAFF_REST_VEC:
 *       20-number array defining the resting cubic Bezier x-coordinates for
 *       the Left Edge [0..9] and Right Edge [10..19] in a 1000x1000 viewBox.
 * ============================================================================
 */

const ANIMATION_CONFIG = {
  MORPH_DURATION_MS: 1050,
  CONTENT_SWAP_DELAY_MS: 240,
  CONTENT_FADE_IN_MS: 660,
  UNLOCK_DELAY_MS: 1070,

  // Liquid curve physics (increase for more dramatic wave, decrease for subtler curve)
  LEAD_BOW_STRENGTH: 76,
  TRAIL_DRAG_STRENGTH: 60,
  SPRING_WOBBLE_STRENGTH: 88,
  SPRING_DAMPING: 4.6,
  SPRING_FREQUENCY: 2.8,

  // Resting State 1: GUEST MODE (#guest) — Fluid panel on RIGHT
  // Indices [0..9] = uneven organic wave on Left edge; [10..19] = flat Right wall (1012)
  GUEST_REST_VEC: [
    78, 152, 19, 98, 162, 31, 114, 168, 39, 86,
    1012, 1012, 1012, 1012, 1012, 1012, 1012, 1012, 1012, 1012
  ],

  // Resting State 2: STAFF MODE (#staff) — Fluid panel on LEFT
  // Indices [0..9] = flat Left wall (-12); [10..19] = uneven organic wave on Right edge
  STAFF_REST_VEC: [
    -12, -12, -12, -12, -12, -12, -12, -12, -12, -12,
    922, 848, 981, 902, 838, 969, 886, 832, 961, 914
  ],

  // Vertical weights along the wave edge so each crest deforms unevenly
  WAVE_WEIGHTS: [0.45, 1.15, 0.85, 1.05, 1.32, 0.88, 1.14, 1.24, 0.78, 0.48]
};

document.addEventListener('DOMContentLoaded', () => {
  const loginStage = document.getElementById('loginStage');
  const welcomeContentInner = document.getElementById('welcomeContentInner');
  const fluidFormWrapper = document.getElementById('fluidFormWrapper');
  const loginFormCard = document.getElementById('loginFormCard');
  const cardDynamicViewport = document.getElementById('cardDynamicViewport');
  const fluidBodyPath = document.getElementById('fluidBodyPath');
  const mobileWavePath = document.getElementById('mobileWavePath');

  const sideSwitchBtn = document.getElementById('sideSwitchBtn');
  const mobileSideSwitchBtn = document.getElementById('mobileSideSwitchBtn');
  const welcomeModePill = document.getElementById('welcomeModePill');
  const welcomeHeading = document.getElementById('welcomeHeading');
  const welcomeSubtext = document.getElementById('welcomeSubtext');
  const mobileWelcomeHeading = document.getElementById('mobileWelcomeHeading');
  const mobileWelcomeSubtext = document.getElementById('mobileWelcomeSubtext');

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

  const panes = {
    'guest-login': document.getElementById('guestLoginForm'),
    'guest-register': document.getElementById('guestRegisterForm'),
    'operator-login': document.getElementById('operatorLoginForm'),
    'operator-register': document.getElementById('operatorRegisterForm'),
    'admin-login': document.getElementById('adminLoginForm')
  };

  if (!loginStage || !loginFormCard) return;

  let isStaffMode = false;          // false = Guest (#guest), true = Staff (#staff)
  let activeStaffRole = 'operator'; // 'operator' or 'admin'
  let activeGuestTab = 'login';     // 'login' or 'register'
  let activeOperatorTab = 'login';  // 'login' or 'register'
  let isAnimating = false;
  let activeRafId = null;

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const isMobileViewport = () => window.innerWidth < 768;

  /**
   * ==========================================================================
   * 1. DESKTOP/TABLET HORIZONTAL LIQUID SVG PATH MORPH & MOBILE VERTICAL SWEEP
   * ==========================================================================
   */
  function buildDesktopFluidPath(v) {
    return (
      `M${v[0].toFixed(1)},-8 ` +
      `C${v[1].toFixed(1)},102 ${v[2].toFixed(1)},218 ${v[3].toFixed(1)},334 ` +
      `C${v[4].toFixed(1)},428 ${v[5].toFixed(1)},544 ${v[6].toFixed(1)},668 ` +
      `C${v[7].toFixed(1)},762 ${v[8].toFixed(1)},882 ${v[9].toFixed(1)},1008 ` +
      `L${v[19].toFixed(1)},1008 ` +
      `C${v[18].toFixed(1)},882 ${v[17].toFixed(1)},762 ${v[16].toFixed(1)},668 ` +
      `C${v[15].toFixed(1)},544 ${v[14].toFixed(1)},428 ${v[13].toFixed(1)},334 ` +
      `C${v[12].toFixed(1)},218 ${v[11].toFixed(1)},102 ${v[10].toFixed(1)},-8 Z`
    );
  }

  // Smooth cubic-bezier(0.65, 0, 0.35, 1) approximation
  function easeFluidGlide(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /**
   * Computes the 20-point horizontal liquid morph vector at normalized time t in [0, 1].
   */
  function computeLiquidMorphVector(t, toStaff) {
    const {
      GUEST_REST_VEC,
      STAFF_REST_VEC,
      WAVE_WEIGHTS,
      LEAD_BOW_STRENGTH,
      TRAIL_DRAG_STRENGTH,
      SPRING_WOBBLE_STRENGTH,
      SPRING_DAMPING,
      SPRING_FREQUENCY
    } = ANIMATION_CONFIG;

    const out = new Array(20);
    const leadT = easeFluidGlide(Math.min(1, Math.pow(t, 0.68)));
    const trailT = easeFluidGlide(Math.pow(t, 1.38));

    const leadBowPhase = t < 0.68 ? Math.sin((t / 0.68) * Math.PI) : 0;
    const dragImpulse = t < 0.52 ? Math.sin((t / 0.52) * Math.PI) : 0;
    const settlePhase = t > 0.38 ? (t - 0.38) / 0.62 : 0;
    const springWobble =
      settlePhase > 0
        ? Math.exp(-SPRING_DAMPING * settlePhase) *
          Math.sin(settlePhase * Math.PI * SPRING_FREQUENCY) *
          (1 - Math.pow(settlePhase, 3))
        : 0;

    if (toStaff) {
      for (let i = 0; i < 10; i++) {
        const baseL = lerp(GUEST_REST_VEC[i], STAFF_REST_VEC[i], leadT);
        const surgeLeft = -LEAD_BOW_STRENGTH * leadBowPhase * WAVE_WEIGHTS[i] * (1 - leadT * 0.85);
        out[i] = baseL + surgeLeft;
      }
      for (let i = 0; i < 10; i++) {
        const idx = 10 + i;
        const baseR = lerp(GUEST_REST_VEC[idx], STAFF_REST_VEC[idx], trailT);
        const trailDrag = TRAIL_DRAG_STRENGTH * dragImpulse * WAVE_WEIGHTS[i];
        const wobbleOffset = -SPRING_WOBBLE_STRENGTH * springWobble * WAVE_WEIGHTS[9 - i];
        out[idx] = baseR + trailDrag + wobbleOffset;
      }
    } else {
      for (let i = 0; i < 10; i++) {
        const idx = 10 + i;
        const baseR = lerp(STAFF_REST_VEC[idx], GUEST_REST_VEC[idx], leadT);
        const surgeRight = LEAD_BOW_STRENGTH * leadBowPhase * WAVE_WEIGHTS[i] * (1 - leadT * 0.85);
        out[idx] = baseR + surgeRight;
      }
      for (let i = 0; i < 10; i++) {
        const baseL = lerp(STAFF_REST_VEC[i], GUEST_REST_VEC[i], trailT);
        const trailDrag = -TRAIL_DRAG_STRENGTH * dragImpulse * WAVE_WEIGHTS[i];
        const wobbleOffset = SPRING_WOBBLE_STRENGTH * springWobble * WAVE_WEIGHTS[9 - i];
        out[i] = baseL + trailDrag + wobbleOffset;
      }
    }
    return out;
  }

  /**
   * Computes the Mobile (< 768px) vertical wave sweep path at normalized time t in [0, 1].
   * - Guest -> Staff: Wave sweeps UP from bottom (y=1012) to top (y=-12), then clears.
   * - Staff -> Guest: Wave sweeps DOWN from top (y=-12) to bottom (y=1012), then clears.
   */
  function buildMobileVerticalWavePath(t, toStaff) {
    if (t <= 0 || t >= 1) {
      return 'M-8,1012 L-8,1012 C180,1012 340,1012 510,1012 C690,1012 840,1012 1008,1012 L1008,1012 Z';
    }
    const coreY = toStaff
      ? lerp(1012, -12, easeFluidGlide(t))
      : lerp(-12, 1012, easeFluidGlide(t));
    const bow = Math.sin(t * Math.PI) * (toStaff ? -115 : 115);
    const wobble = Math.sin(t * Math.PI * 3) * 35 * (1 - t);

    const c1y = coreY + bow * 0.9 + wobble;
    const c2y = coreY + bow * 1.25 - wobble * 0.7;
    const midY = coreY + bow * 0.85;
    const c3y = coreY + bow * 1.15 + wobble * 0.8;
    const c4y = coreY + bow * 0.7 - wobble;

    if (toStaff) {
      // Sweeping UP from bottom (1012)
      return (
        `M-8,1012 L-8,${coreY.toFixed(1)} ` +
        `C180,${c1y.toFixed(1)} 340,${c2y.toFixed(1)} 510,${midY.toFixed(1)} ` +
        `C690,${c3y.toFixed(1)} 840,${c4y.toFixed(1)} 1008,${coreY.toFixed(1)} ` +
        `L1008,1012 Z`
      );
    }
    // Sweeping DOWN from top (-12)
    return (
      `M-8,-12 L-8,${coreY.toFixed(1)} ` +
      `C180,${c1y.toFixed(1)} 340,${c2y.toFixed(1)} 510,${midY.toFixed(1)} ` +
      `C690,${c3y.toFixed(1)} 840,${c4y.toFixed(1)} 1008,${coreY.toFixed(1)} ` +
      `L1008,-12 Z`
    );
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
      return 'admin-login';
    }
    return activeOperatorTab === 'register' ? 'operator-register' : 'operator-login';
  }

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
   * Synchronizes all headings, specific human copy, tabs & switch buttons
   */
  function syncCardControlsUI() {
    const currentTab = !isStaffMode ? activeGuestTab : activeOperatorTab;

    // 1. Off-white Welcome Panel & Mobile Header Copy (Specific, non-generic copy)
    if (isStaffMode) {
      loginStage.setAttribute('data-mode', 'staff');
      if (welcomeModePill) {
        welcomeModePill.innerHTML = '<i class="fa-solid fa-key"></i> Staff &amp; Operator Access';
      }
      if (welcomeHeading) {
        welcomeHeading.textContent = 'Operator & staff portal';
      }
      if (welcomeSubtext) {
        welcomeSubtext.textContent =
          'Verify guest payment receipts, update your unit calendar, or export monthly reports.';
      }
      if (sideSwitchBtn) {
        sideSwitchBtn.innerHTML = '&larr; Back to guest sign in';
      }
      if (mobileSideSwitchBtn) {
        mobileSideSwitchBtn.innerHTML = '&larr; Back to guest sign in';
      }
      if (mobileWelcomeHeading) {
        mobileWelcomeHeading.textContent = 'Operator & staff portal';
      }
      if (mobileWelcomeSubtext) {
        mobileWelcomeSubtext.textContent = 'Sign in to manage your unit or review bookings.';
      }
    } else {
      loginStage.setAttribute('data-mode', 'user');
      if (welcomeModePill) {
        welcomeModePill.innerHTML = '<i class="fa-regular fa-compass"></i> PERDA Homestay';
      }
      if (welcomeHeading) {
        welcomeHeading.textContent = 'Welcome back';
      }
      if (welcomeSubtext) {
        welcomeSubtext.textContent =
          'Sign in to manage your bookings or check homestay availability in Penang.';
      }
      if (sideSwitchBtn) {
        sideSwitchBtn.innerHTML = 'Homestay operator or PERDA staff? Sign in here &rarr;';
      }
      if (mobileSideSwitchBtn) {
        mobileSideSwitchBtn.innerHTML = 'Homestay operator or PERDA staff? Sign in here &rarr;';
      }
      if (mobileWelcomeHeading) {
        mobileWelcomeHeading.textContent = 'Welcome back';
      }
      if (mobileWelcomeSubtext) {
        mobileWelcomeSubtext.textContent = 'Sign in to manage your bookings.';
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
        if (formCardSubheading) {
          formCardSubheading.textContent = 'Save your details for future homestay bookings';
        }
        if (belowCardPrompt) {
          belowCardPrompt.hidden = false;
          belowCardPrompt.innerHTML =
            'Already have an account? <button type="button" id="belowCardSwitchTabBtn">Sign in</button>';
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
        if (formCardHeading) formCardHeading.textContent = 'Register your homestay';
        if (formCardSubheading) {
          formCardSubheading.textContent = 'Submit your unit details for PERDA verification';
        }
        if (belowCardPrompt) {
          belowCardPrompt.hidden = false;
          belowCardPrompt.innerHTML =
            'Already registered? <button type="button" id="belowCardSwitchTabBtn">Operator login</button>';
        }
      } else {
        if (formCardHeading) formCardHeading.textContent = 'Operator sign in';
        if (formCardSubheading) {
          formCardSubheading.textContent = 'Check bookings and manage your homestay unit';
        }
        if (belowCardPrompt) {
          belowCardPrompt.hidden = false;
          belowCardPrompt.innerHTML =
            'Own a homestay in Penang? <button type="button" id="belowCardSwitchTabBtn">Register as operator</button>';
        }
      }
    } else {
      // Admin Mode: LOGIN ONLY — No register tab and no register link anywhere
      if (formCardHeading) formCardHeading.textContent = 'Admin sign in';
      if (formCardSubheading) {
        formCardSubheading.textContent = 'For verified BPE PERDA officers (@perda.gov.my)';
      }
      if (belowCardPrompt) {
        belowCardPrompt.hidden = true;
        belowCardPrompt.innerHTML = '';
      }
    }

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

    const startHeight = cardDynamicViewport.offsetHeight;
    cardDynamicViewport.style.height = `${startHeight}px`;

    if (prevPane) {
      prevPane.hidden = true;
      prevPane.classList.remove('is-active-pane');
    }
    nextPane.hidden = false;
    nextPane.classList.add('is-active-pane', 'is-pane-entering');

    const targetHeight = nextPane.offsetHeight;
    void cardDynamicViewport.offsetHeight;
    cardDynamicViewport.style.height = `${targetHeight}px`;

    requestAnimationFrame(() => {
      nextPane.classList.remove('is-pane-entering');
    });

    setTimeout(() => {
      cardDynamicViewport.style.height = '';
      focusFirstActiveField();
    }, 320);
  }

  /**
   * ==========================================================================
   * 3. GUEST <-> STAFF FLUID PANEL SWITCHING ANIMATION
   *    - Desktop & Tablet: Horizontal glide + SVG curve morph
   *    - Mobile (< 768px): Vertical wave sweep up/down
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
        buildDesktopFluidPath(
          staffMode ? ANIMATION_CONFIG.STAFF_REST_VEC : ANIMATION_CONFIG.GUEST_REST_VEC
        )
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

    // Accessibility: prefers-reduced-motion quick crossfade
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
            buildDesktopFluidPath(
              targetStaffMode ? ANIMATION_CONFIG.STAFF_REST_VEC : ANIMATION_CONFIG.GUEST_REST_VEC
            )
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

    const mobileMode = isMobileViewport();

    // 1. Fade & slide out current content (vertical on mobile, horizontal on desktop/tablet)
    const formExitClass = mobileMode
      ? targetStaffMode
        ? 'is-exiting-up'
        : 'is-exiting-down'
      : targetStaffMode
        ? 'is-exiting-left'
        : 'is-exiting-right';
    const welcomeExitClass = targetStaffMode ? 'is-exiting-right' : 'is-exiting-left';
    const formStageClass = mobileMode
      ? targetStaffMode
        ? 'is-staging-up'
        : 'is-staging-down'
      : targetStaffMode
        ? 'is-staging-right'
        : 'is-staging-left';
    const welcomeStageClass = targetStaffMode ? 'is-staging-left' : 'is-staging-right';

    fluidFormWrapper?.classList.add(formExitClass);
    welcomeContentInner?.classList.add(welcomeExitClass);

    if (!mobileMode) {
      loginStage.classList.toggle('is-staff-mode', targetStaffMode);
    } else if (mobileWavePath) {
      mobileWavePath.style.fill = targetStaffMode ? 'var(--dark-green)' : 'var(--olive)';
    }

    // 2. Run rAF SVG Path Morph (Desktop horizontal morph OR Mobile vertical wave sweep)
    const startTime = performance.now();
    if (activeRafId) cancelAnimationFrame(activeRafId);

    function stepLiquidMorph(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / ANIMATION_CONFIG.MORPH_DURATION_MS);

      if (mobileMode) {
        if (mobileWavePath) {
          mobileWavePath.setAttribute('d', buildMobileVerticalWavePath(progress, targetStaffMode));
        }
      } else if (fluidBodyPath) {
        const vec = computeLiquidMorphVector(progress, targetStaffMode);
        fluidBodyPath.setAttribute('d', buildDesktopFluidPath(vec));
      }

      if (progress < 1) {
        activeRafId = requestAnimationFrame(stepLiquidMorph);
      } else {
        if (fluidBodyPath) {
          fluidBodyPath.setAttribute(
            'd',
            buildDesktopFluidPath(
              targetStaffMode ? ANIMATION_CONFIG.STAFF_REST_VEC : ANIMATION_CONFIG.GUEST_REST_VEC
            )
          );
        }
        if (mobileWavePath) {
          mobileWavePath.setAttribute('d', buildMobileVerticalWavePath(1, targetStaffMode));
        }
        activeRafId = null;
      }
    }

    activeRafId = requestAnimationFrame(stepLiquidMorph);

    // 3. Mid-flight swap while content is hidden
    setTimeout(() => {
      if (mobileMode) {
        loginStage.classList.toggle('is-staff-mode', targetStaffMode);
      }
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
    }, ANIMATION_CONFIG.CONTENT_SWAP_DELAY_MS);

    // 4. Delayed fade-in after panel has mostly arrived
    setTimeout(() => {
      void fluidFormWrapper?.offsetWidth;
      fluidFormWrapper?.classList.remove(formStageClass);
      welcomeContentInner?.classList.remove(welcomeStageClass);
    }, ANIMATION_CONFIG.CONTENT_FADE_IN_MS);

    // 5. Unlock interaction & focus first field
    setTimeout(() => {
      loginStage.classList.remove('is-animating');
      isAnimating = false;
      focusFirstActiveField();
    }, ANIMATION_CONFIG.UNLOCK_DELAY_MS);
  }

  // Bind both Desktop/Tablet and Mobile mode switch buttons
  sideSwitchBtn?.addEventListener('click', () => triggerModeSwitch(!isStaffMode, true));
  mobileSideSwitchBtn?.addEventListener('click', () => triggerModeSwitch(!isStaffMode, true));

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
   * 4. SHOW / HIDE PASSWORD TOGGLES
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
        ? '<i class="fa-regular fa-eye-slash"></i>'
        : '<i class="fa-regular fa-eye"></i>';
      btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    });
  });

  /**
   * ==========================================================================
   * 5. INLINE FIELD VALIDATION, CARD SHAKE & BUTTON LOADING STATE
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
        : 'fa-solid fa-circle-exclamation mt-1';
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
    void loginFormCard.offsetWidth;
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
      // Static file or offline environment: continue with client-side verification
    }
    return { handledByServer: false };
  }

  /**
   * ==========================================================================
   * 6. FORM SUBMISSIONS (Guest Login/Register, Operator Login/Register, Admin)
   * ==========================================================================
   */

  // PANE 1: GUEST LOGIN -> Redirects to Landing Page (index.html)
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

    let storedGuests = [];
    try {
      storedGuests = JSON.parse(localStorage.getItem('perda_registered_guests') || '[]');
    } catch (err) {}

    const matchedGuest = storedGuests.find(
      (g) =>
        g.email.toLowerCase() === identity.toLowerCase() ||
        g.name.toLowerCase() === identity.toLowerCase()
    );

    if ((matchedGuest && matchedGuest.password !== password) || password.toLowerCase() === 'wrongpass') {
      setButtonLoading(panes['guest-login'], false);
      showCardBanner('Incorrect email/username or password. Please check your details and try again.');
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

    window.location.href = 'index.html';
  });

  // PANE 2: GUEST REGISTER -> /register-tourist -> Redirects to Landing Page (index.html)
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
      setFieldError(passEl, 'guestRegPasswordError', 'Please enter a password.');
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
      setFieldError(termsEl, 'guestRegTermsError', 'Please agree to the booking terms to continue.');
      hasError = true;
    }

    if (hasError) {
      triggerCardShake();
      return;
    }

    setButtonLoading(panes['guest-register'], true, 'Creating account...');
    await new Promise((r) => setTimeout(r, 650));

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

    window.location.href = 'index.html';
  });

  // PANE 3: OPERATOR LOGIN -> Redirects to Operator Dashboard (dashboard.html?role=operator)
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

    setButtonLoading(panes['operator-login'], true, 'Signing in...');
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
          ? `No operator account found for "${identity}".`
          : 'Incorrect password for this operator account.'
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

    window.location.href = 'dashboard.html?role=operator';
  });

  // PANE 4: OPERATOR REGISTER -> Displays Pending Approval Notice
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

    setButtonLoading(panes['operator-register'], true, 'Submitting...');
    await new Promise((r) => setTimeout(r, 650));
    setButtonLoading(panes['operator-register'], false);

    panes['operator-register'].reset();

    showCardBanner(
      'Your account will be reviewed and approved before you can log in.',
      true
    );
  });

  // PANE 5: ADMIN LOGIN ONLY -> Redirects to Admin Dashboard (dashboard.html?role=officer)
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
      setFieldError(identityEl, 'adminLoginIdentityError', 'Please enter your PERDA admin email.');
      hasError = true;
    } else if (!EMAIL_REGEX.test(identity)) {
      setFieldError(identityEl, 'adminLoginIdentityError', 'Please enter a valid email address.');
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

    setButtonLoading(panes['admin-login'], true, 'Signing in...');
    await new Promise((r) => setTimeout(r, 650));

    const emailLower = identity.toLowerCase();
    if (!emailLower.endsWith('@perda.gov.my')) {
      setButtonLoading(panes['admin-login'], false);
      showCardBanner('Admin login only accepts registered @perda.gov.my email addresses.');
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
          ? `This @perda.gov.my email is not registered as a verified BPE officer.`
          : 'Incorrect password for this administrator account.'
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

    window.location.href = 'dashboard.html?role=officer';
  });

  // Social Login Buttons (Guest Mode Only: /auth/google, /auth/facebook, /auth/apple)
  // If OAuth credentials are not configured yet, show "Not available yet" instead of a broken page.
  document.querySelectorAll('.social-auth-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const provider = btn.getAttribute('data-social-provider') || 'Social';
      const href = btn.getAttribute('href') || '';

      // If running over HTTP/HTTPS, probe the endpoint first to see if Socialite is configured
      if (window.location.protocol.startsWith('http') && href) {
        try {
          const res = await fetch(href, {
            method: 'GET',
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
          });
          if (res.ok && res.redirected && !res.url.includes('/login')) {
            window.location.href = res.url;
            return;
          }
        } catch (err) {
          // Fall through to "Not available yet" message
        }
      }

      e.preventDefault();
      showCardBanner(`${provider} sign-in: Not available yet.`);
    });
  });

  // Forgot Password Modal
  const forgotForm = document.getElementById('forgotPasswordForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('resetPasswordEmail')?.value.trim();
      const feedback = document.getElementById('forgotPasswordFeedback');
      if (!email || !EMAIL_REGEX.test(email)) {
        if (feedback) {
          feedback.innerHTML = `<div class="small fw-semibold mt-2" style="color: var(--burnt-orange);">Please enter a valid email address.</div>`;
        }
        return;
      }
      if (feedback) {
        feedback.innerHTML = `<div class="p-2 rounded-2 small fw-semibold mt-2" style="background: var(--olive); color: var(--cream);">Password reset link sent to ${email}.</div>`;
      }
    });
  }

  // Initialize from URL hash (#staff or default #guest)
  const initialHash = window.location.hash.toLowerCase();
  setInitialLoginMode(initialHash === '#staff');
});
