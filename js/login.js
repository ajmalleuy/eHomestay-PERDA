/**
 * ============================================================================
 * e-Homestay PERDA - 3-Phase Liquid Flood, Gooey Droplets & Login Controller
 * ============================================================================
 * TIMING CONSTANTS (in seconds — adjust these to tune the transition speed):
 *   - TIMING_CARD_FADE_OUT:   Fade & slide out of card and welcome text (0.20s)
 *   - TIMING_PHASE1_FLOOD:    Phase 1 — Dark green fluid floods across screen (0.85s)
 *   - TIMING_PHASE2_HOLD:     Phase 2 — Solid dark screen hold while DOM swaps (0.10s)
 *   - TIMING_PHASE3_RETURN:   Phase 3 — Cream returns from opposite edge with
 *                             irregular gooey droplets & settles (1.00s)
 *   - TIMING_CARD_FADE_IN:    Card and welcome text fade in + upward slide (0.30s)
 *   - TIMING_REDUCED_MOTION:  Simple crossfade when prefers-reduced-motion is on (0.30s)
 *   Total transition time:    ~2.10s
 * ============================================================================
 */

const TIMING_CARD_FADE_OUT  = 0.20;
const TIMING_PHASE1_FLOOD   = 0.85;
const TIMING_PHASE2_HOLD    = 0.10;
const TIMING_PHASE3_RETURN  = 1.00;
const TIMING_CARD_FADE_IN   = 0.30;
const TIMING_REDUCED_MOTION = 0.30;

/**
 * WAVE CURVE & PHYSICS CONSTANTS (in 0..1000 SVG viewBox coordinates)
 */
const WAVE_CONFIG = {
  // Resting wavy boundary X-coordinates (10 points from top y=-15 to bottom y=1015)
  // Guest Mode: Cream on LEFT (0..~445), Dark Fluid on RIGHT (~445..1000)
  GUEST_REST_X: [438, 492, 398, 456, 504, 408, 466, 508, 414, 444],

  // Staff Mode: Dark Fluid on LEFT (0..~555), Cream on RIGHT (~555..1000)
  STAFF_REST_X: [562, 508, 602, 544, 496, 592, 534, 492, 586, 556],

  // Tablet offset (shifts resting boundary toward 45% / 55% split on 768px-1023px)
  TABLET_GUEST_OFFSET: 38,
  TABLET_STAFF_OFFSET: -38,

  // Mobile resting top wave Y-coordinates (10 points from left x=-15 to right x=1015)
  MOBILE_REST_Y: [18, 36, 8, 28, 42, 12, 32, 38, 10, 22],

  // Lead/lag weights across the 10 vertical wave points:
  // Middle points (indices 3..6) lead strongly; top & bottom corners (0, 9) lag behind
  CENTER_LEAD_WEIGHTS: [0.12, 0.48, 0.78, 0.96, 1.00, 0.98, 0.88, 0.68, 0.42, 0.10],

  // Amplitudes for leading belly bow, traveling wobble, and final settle overshoot
  FLOOD_CENTER_BOW: 135,
  FLOOD_WOBBLE_AMP: 28,
  RETURN_CENTER_BOW: 115,
  SETTLE_OVERSHOOT_AMP: 38
};

/**
 * DESKTOP / TABLET DROPLETS DATA ARRAY (7 irregular droplets for Phase 3)
 * - type: 'cream-lead' -> Small irregular cream droplets just ahead of the main
 *   cream edge inside the dark area; stretched & absorbed by the advancing cream wave.
 * - type: 'dark-trail' -> Irregular dark green blobs left behind inside the cream
 *   area for a moment, which slowly shrink and merge back into the dark side.
 */
const DESKTOP_DROPLETS_DATA = [
  // 4 Leading Cream Droplets (ahead of the cream wave inside the dark area)
  { id: 'd1', type: 'cream-lead', pos: 210, rx: 24, ry: 16, skew: 1.35, speed: 1.22, delay: 0.04, dist: 86 },
  { id: 'd2', type: 'cream-lead', pos: 390, rx: 32, ry: 21, skew: 1.42, speed: 1.08, delay: 0.10, dist: 108 },
  { id: 'd3', type: 'cream-lead', pos: 585, rx: 20, ry: 14, skew: 1.28, speed: 1.30, delay: 0.07, dist: 78 },
  { id: 'd4', type: 'cream-lead', pos: 775, rx: 27, ry: 18, skew: 1.38, speed: 1.14, delay: 0.15, dist: 94 },

  // 3 Trailing Dark Green Blobs (break off inside the cream area & merge back into dark side)
  { id: 'd5', type: 'dark-trail', pos: 295, rx: 34, ry: 23, skew: 0.72, speed: 0.86, delay: 0.12, dist: 95 },
  { id: 'd6', type: 'dark-trail', pos: 515, rx: 40, ry: 26, skew: 0.68, speed: 0.78, delay: 0.18, dist: 115 },
  { id: 'd7', type: 'dark-trail', pos: 710, rx: 29, ry: 19, skew: 0.75, speed: 0.92, delay: 0.14, dist: 88 }
];

/**
 * MOBILE DROPLETS DATA ARRAY (4 irregular droplets for < 768px vertical sweep)
 */
const MOBILE_DROPLETS_DATA = [
  { id: 'm1', type: 'cream-lead', pos: 260, rx: 22, ry: 30, skew: 1.32, speed: 1.18, delay: 0.06, dist: 90 },
  { id: 'm2', type: 'cream-lead', pos: 710, rx: 26, ry: 34, skew: 1.38, speed: 1.10, delay: 0.12, dist: 105 },
  { id: 'm3', type: 'dark-trail', pos: 380, rx: 28, ry: 36, skew: 0.74, speed: 0.84, delay: 0.14, dist: 95 },
  { id: 'm4', type: 'dark-trail', pos: 640, rx: 24, ry: 32, skew: 0.78, speed: 0.90, delay: 0.18, dist: 85 }
];

/**
 * FLOATING LINE-ART BACKGROUND ICONS DATA ARRAY
 * - Positioned in screen percentages (startX/startY for Guest layout on right,
 *   endX/endY for Staff layout on left).
 * - depth (0.6 to 1.4): controls parallax speed & travel distance so higher-depth
 *   icons move slightly faster and further than lower-depth icons.
 * - rotation: resting angle (deg); staffRotation: resting angle in staff mode;
 *   travelRot: rotation delta while travelling (-12 to +12 deg, unique per icon).
 * - lagMs: delay (0.00s to 0.15s) before following the fluid edge.
 * - mobile: 6 icons enabled on < 768px for vertical fluid travel.
 */
const FLUID_ICONS_DATA = [
  {
    id: 'ic-1',
    symbol: '#icon-house',
    svgPath: 'M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5.5v-6.5h-5V21H4a1 1 0 0 1-1-1v-9.5Z',
    size: 37,
    startX: 52.5,
    startY: 11.0,
    endX: 11.0,
    endY: 11.0,
    depth: 1.15,
    rotation: -14,
    staffRotation: -13,
    travelRot: -10,
    lagMs: 0.03,
    bobAmp: 3.0,
    bobDur: 7.2,
    bobDelay: -1.1,
    mobile: true,
    mobileX: 14.0,
    mobileGuestY: 16.0,
    mobileStaffY: 21.0
  },
  {
    id: 'ic-2',
    symbol: '#icon-envelope',
    svgPath: 'M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11ZM3.5 6l8.5 6.25L20.5 6',
    size: 43,
    startX: 90.0,
    startY: 16.0,
    endX: 48.0,
    endY: 16.0,
    depth: 0.72,
    rotation: 12,
    staffRotation: 11,
    travelRot: 9,
    lagMs: 0.12,
    bobAmp: 3.5,
    bobDur: 8.4,
    bobDelay: -3.4,
    mobile: true,
    mobileX: 85.0,
    mobileGuestY: 19.0,
    mobileStaffY: 24.0
  },
  {
    id: 'ic-3',
    symbol: '#icon-key',
    svgPath: 'M7.5 15.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9ZM12 11h9v3.5M17.5 11v2.5',
    size: 34,
    startX: 48.5,
    startY: 35.0,
    endX: 8.0,
    endY: 35.0,
    depth: 1.35,
    rotation: 9,
    staffRotation: 10,
    travelRot: -11,
    lagMs: 0.01,
    bobAmp: 2.5,
    bobDur: 6.4,
    bobDelay: -2.2,
    mobile: true,
    mobileX: 11.0,
    mobileGuestY: 43.0,
    mobileStaffY: 48.0
  },
  {
    id: 'ic-4',
    symbol: '#icon-location-pin',
    svgPath: 'M12 21.5s-7-5.75-7-11.25a7 7 0 1 1 14 0c0 5.5-7 11.25-7 11.25ZM12 13a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5Z',
    size: 35,
    startX: 86.0,
    startY: 30.0,
    endX: 44.5,
    endY: 30.0,
    depth: 0.88,
    rotation: -19,
    staffRotation: -18,
    travelRot: 8,
    lagMs: 0.09,
    bobAmp: 3.2,
    bobDur: 7.9,
    bobDelay: -4.7,
    mobile: false,
    mobileX: 84.0,
    mobileGuestY: 36.0,
    mobileStaffY: 41.0
  },
  {
    id: 'ic-5',
    symbol: '#icon-compass',
    svgPath: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM15.5 8.5l-2.1 5.1-5.1 2.1 2.1-5.1 5.1-2.1Z',
    size: 42,
    startX: 50.5,
    startY: 57.0,
    endX: 10.0,
    endY: 57.0,
    depth: 1.26,
    rotation: -8,
    staffRotation: -7,
    travelRot: -12,
    lagMs: 0.02,
    bobAmp: 3.8,
    bobDur: 6.8,
    bobDelay: -0.7,
    mobile: true,
    mobileX: 87.0,
    mobileGuestY: 64.0,
    mobileStaffY: 69.0
  },
  {
    id: 'ic-6',
    symbol: '#icon-paper-plane',
    svgPath: 'M21.5 3.5L10.5 14.5M21.5 3.5l-6.5 17.5-4.5-6.5-6.5-4.5 17.5-6.5Z',
    size: 37,
    startX: 91.5,
    startY: 60.0,
    endX: 49.5,
    endY: 60.0,
    depth: 0.62,
    rotation: 16,
    staffRotation: 15,
    travelRot: 11,
    lagMs: 0.15,
    bobAmp: 2.8,
    bobDur: 8.8,
    bobDelay: -5.3,
    mobile: true,
    mobileX: 15.0,
    mobileGuestY: 82.0,
    mobileStaffY: 86.0
  },
  {
    id: 'ic-7',
    symbol: '#icon-key',
    svgPath: 'M7.5 15.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9ZM12 11h9v3.5M17.5 11v2.5',
    size: 35,
    startX: 54.0,
    startY: 83.0,
    endX: 13.5,
    endY: 83.0,
    depth: 1.05,
    rotation: 14,
    staffRotation: 13,
    travelRot: -9,
    lagMs: 0.06,
    bobAmp: 2.4,
    bobDur: 7.5,
    bobDelay: -2.9,
    mobile: false,
    mobileX: 22.0,
    mobileGuestY: 85.0,
    mobileStaffY: 88.0
  },
  {
    id: 'ic-8',
    symbol: '#icon-location-pin',
    svgPath: 'M12 21.5s-7-5.75-7-11.25a7 7 0 1 1 14 0c0 5.5-7 11.25-7 11.25ZM12 13a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5Z',
    size: 45,
    startX: 88.0,
    startY: 87.0,
    endX: 46.5,
    endY: 87.0,
    depth: 0.78,
    rotation: -11,
    staffRotation: -12,
    travelRot: 10,
    lagMs: 0.11,
    bobAmp: 3.6,
    bobDur: 8.2,
    bobDelay: -6.1,
    mobile: true,
    mobileX: 83.0,
    mobileGuestY: 85.0,
    mobileStaffY: 89.0
  },
  {
    id: 'ic-9',
    symbol: '#icon-envelope',
    svgPath: 'M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11ZM3.5 6l8.5 6.25L20.5 6',
    size: 32,
    startX: 71.0,
    startY: 12.0,
    endX: 29.0,
    endY: 12.0,
    depth: 1.40,
    rotation: 15,
    staffRotation: 14,
    travelRot: -8,
    lagMs: 0.00,
    bobAmp: 2.2,
    bobDur: 6.2,
    bobDelay: -1.8,
    mobile: false,
    mobileX: 50.0,
    mobileGuestY: 14.0,
    mobileStaffY: 18.0
  }
];

document.addEventListener('DOMContentLoaded', () => {
  const loginStage = document.getElementById('loginStage');
  const welcomeContentInner = document.getElementById('welcomeContentInner');
  const fluidFormWrapper = document.getElementById('fluidFormWrapper');
  const loginFormCard = document.getElementById('loginFormCard');
  const cardDynamicViewport = document.getElementById('cardDynamicViewport');

  // Full-Screen SVG Paths, Droplet Groups & Floating Icons Group
  const darkFluidMainPath = document.getElementById('darkFluidMainPath');
  const creamFluidMainPath = document.getElementById('creamFluidMainPath');
  const darkBridgePath = document.getElementById('darkBridgePath');
  const creamDropletsGroup = document.getElementById('creamDropletsGroup');
  const darkTrailingBlobsGroup = document.getElementById('darkTrailingBlobsGroup');
  const waveBoundaryStrokePath = document.getElementById('waveBoundaryStrokePath');
  const fluidFloatingIconsGroup = document.getElementById('fluidFloatingIconsGroup');

  const sideSwitchBtn = document.getElementById('sideSwitchBtn');
  const mobileSideSwitchBtn = document.getElementById('mobileSideSwitchBtn');
  const welcomeModePill = document.getElementById('welcomeModePill');
  const welcomeHeading = document.getElementById('welcomeHeading');
  const welcomeSubtext = document.getElementById('welcomeSubtext');
  const mobileWelcomeHeading = document.getElementById('mobileWelcomeHeading');
  const mobileWelcomeSubtext = document.getElementById('mobileWelcomeSubtext');

  // Card Top Controls
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
  let activeTimeline = null;

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const isMobileViewport = () => window.innerWidth < 768;
  const isTabletViewport = () => window.innerWidth >= 768 && window.innerWidth < 1024;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /**
   * ==========================================================================
   * 1. SVG WAVE & IRREGULAR DROPLET PATH BUILDERS
   * ==========================================================================
   */

  /**
   * Returns the 10-point resting X-vector for Desktop or Tablet
   */
  function getRestingWaveX(staffMode) {
    const base = staffMode ? WAVE_CONFIG.STAFF_REST_X : WAVE_CONFIG.GUEST_REST_X;
    const tabletOffset = isTabletViewport()
      ? staffMode
        ? WAVE_CONFIG.TABLET_STAFF_OFFSET
        : WAVE_CONFIG.TABLET_GUEST_OFFSET
      : 0;
    return base.map((x) => x + tabletOffset);
  }

  /**
   * Builds a vertical wavy curve string from top (y=-20) to bottom (y=1020)
   * given 10 X-coordinates [x0..x9].
   */
  function buildVerticalWaveCurve(xVec) {
    return (
      `M${xVec[0].toFixed(1)},-20 ` +
      `C${xVec[1].toFixed(1)},95 ${xVec[2].toFixed(1)},215 ${xVec[3].toFixed(1)},335 ` +
      `C${xVec[4].toFixed(1)},435 ${xVec[5].toFixed(1)},555 ${xVec[6].toFixed(1)},670 ` +
      `C${xVec[7].toFixed(1)},775 ${xVec[8].toFixed(1)},895 ${xVec[9].toFixed(1)},1020`
    );
  }

  /**
   * Builds a closed 2D polygon path for a vertical wave edge anchored to either
   * the RIGHT wall (x=1040) or LEFT wall (x=-40).
   */
  function buildHorizontalRegionPath(xVec, anchorSide) {
    const wallX = anchorSide === 'right' ? 1040 : -40;
    return (
      buildVerticalWaveCurve(xVec) +
      ` L${wallX},1020 L${wallX},-20 Z`
    );
  }

  /**
   * Builds a horizontal wavy curve string from left (x=-20) to right (x=1020)
   * given 10 Y-coordinates [y0..y9] (for Mobile < 768px).
   */
  function buildHorizontalWaveCurve(yVec) {
    return (
      `M-20,${yVec[0].toFixed(1)} ` +
      `C95,${yVec[1].toFixed(1)} 215,${yVec[2].toFixed(1)} 335,${yVec[3].toFixed(1)} ` +
      `C435,${yVec[4].toFixed(1)} 555,${yVec[5].toFixed(1)} 670,${yVec[6].toFixed(1)} ` +
      `C775,${yVec[7].toFixed(1)} 895,${yVec[8].toFixed(1)} 1020,${yVec[9].toFixed(1)}`
    );
  }

  /**
   * Builds a closed 2D polygon path for a horizontal wave edge anchored to either
   * the BOTTOM wall (y=1040) or TOP wall (y=-40) on Mobile.
   */
  function buildVerticalRegionPath(yVec, anchorSide) {
    const wallY = anchorSide === 'bottom' ? 1040 : -40;
    return (
      buildHorizontalWaveCurve(yVec) +
      ` L1020,${wallY} L-20,${wallY} Z`
    );
  }

  /**
   * Generates an irregular, organic liquid blob <path> (not a perfect circle)
   * around (cx, cy) with radii (rx, ry), asymmetric lobe skew, and wobble.
   */
  function buildIrregularDropletPath(cx, cy, rx, ry, skew = 1.25, wobblePhase = 0) {
    if (rx <= 0.4 || ry <= 0.4) return '';

    const k = 0.552;
    const rRight = rx * skew;
    const rLeft = rx * (2 - Math.min(1.5, skew));
    const rTop = ry * (1 + 0.14 * Math.sin(wobblePhase));
    const rBot = ry * (1 - 0.12 * Math.cos(wobblePhase));

    const xR = cx + rRight;
    const xL = cx - rLeft;
    const yT = cy - rTop;
    const yB = cy + rBot;

    return (
      `M${xR.toFixed(1)},${cy.toFixed(1)} ` +
      `C${xR.toFixed(1)},${(cy + rBot * k).toFixed(1)} ${(cx + rRight * k).toFixed(1)},${yB.toFixed(1)} ${cx.toFixed(1)},${yB.toFixed(1)} ` +
      `C${(cx - rLeft * k).toFixed(1)},${yB.toFixed(1)} ${xL.toFixed(1)},${(cy + rBot * k).toFixed(1)} ${xL.toFixed(1)},${cy.toFixed(1)} ` +
      `C${xL.toFixed(1)},${(cy - rTop * k).toFixed(1)} ${(cx - rLeft * k).toFixed(1)},${yT.toFixed(1)} ${cx.toFixed(1)},${yT.toFixed(1)} ` +
      `C${(cx + rRight * k).toFixed(1)},${yT.toFixed(1)} ${xR.toFixed(1)},${(cy - rTop * k).toFixed(1)} ${xR.toFixed(1)},${cy.toFixed(1)} Z`
    );
  }

  /**
   * ==========================================================================
   * 2. RENDER STATIC / RESTING SVG FLUID STATE & FLOATING ICONS
   * ==========================================================================
   */
  const fluidIconNodes = [];

  function buildFluidIconsDOM() {
    if (!fluidFloatingIconsGroup || fluidIconNodes.length > 0) return;
    fluidFloatingIconsGroup.innerHTML = '';

    const svgNS = 'http://www.w3.org/2000/svg';

    FLUID_ICONS_DATA.forEach((item) => {
      // 1. Position group in 0..1000 SVG coordinates (animated with GSAP x, y)
      const posEl = document.createElementNS(svgNS, 'g');
      posEl.setAttribute('class', 'fluid-icon-pos');
      posEl.setAttribute('id', `fluidIconPos-${item.id}`);

      // 2. Aspect-ratio compensation group (keeps icons 1:1 square pixels at any screen size)
      const aspectEl = document.createElementNS(svgNS, 'g');
      aspectEl.setAttribute('class', 'fluid-icon-aspect');

      // 3. Rotation group in 1:1 pixel coordinates (animated with GSAP rotation)
      const rotEl = document.createElementNS(svgNS, 'g');
      rotEl.setAttribute('class', 'fluid-icon-rot');
      rotEl.setAttribute('id', `fluidIconRot-${item.id}`);

      // 4. Subtle resting floating bob group (2 to 4px, 6 to 9s, disabled in reduced motion)
      const bobEl = document.createElementNS(svgNS, 'g');
      bobEl.setAttribute('class', 'fluid-icon-bob');
      bobEl.style.setProperty('--bob-amp', `${item.bobAmp}px`);
      bobEl.style.setProperty('--bob-dur', `${item.bobDur}s`);
      bobEl.style.setProperty('--bob-delay', `${item.bobDelay}s`);

      // 5. Crisp line-art icon symbol reference
      const useEl = document.createElementNS(svgNS, 'use');
      useEl.setAttribute('href', item.symbol);
      useEl.setAttribute('class', 'fluid-icon-graphic');

      bobEl.appendChild(useEl);
      rotEl.appendChild(bobEl);
      aspectEl.appendChild(rotEl);
      posEl.appendChild(aspectEl);
      fluidFloatingIconsGroup.appendChild(posEl);

      fluidIconNodes.push({ item, posEl, aspectEl, rotEl, bobEl, useEl });
    });
  }

  function getIconTargetCoords(item, staffMode) {
    if (isMobileViewport()) {
      return {
        x: item.mobileX * 10,
        y: (staffMode ? item.mobileStaffY : item.mobileGuestY) * 10,
        rot: staffMode ? item.staffRotation : item.rotation
      };
    }

    const tabletAdjust = isTabletViewport() ? (staffMode ? -2.2 : 2.2) : 0;
    const pctX = (staffMode ? item.endX : item.startX) + tabletAdjust;
    const pctY = staffMode ? item.endY : item.startY;

    return {
      x: pctX * 10,
      y: pctY * 10,
      rot: staffMode ? item.staffRotation : item.rotation
    };
  }

  function syncIconsViewportMetrics() {
    buildFluidIconsDOM();
    const vw = Math.max(320, window.innerWidth || 1280);
    const vh = Math.max(320, window.innerHeight || 800);
    const scaleX = 1000 / vw;
    const scaleY = 1000 / vh;
    const mobileMode = isMobileViewport();
    const sizeFactor = mobileMode ? 0.68 : isTabletViewport() ? 0.74 : 1.0;

    fluidIconNodes.forEach(({ item, posEl, aspectEl, useEl }) => {
      if (mobileMode && !item.mobile) {
        posEl.style.display = 'none';
      } else {
        posEl.style.display = '';
      }

      aspectEl.setAttribute('transform', `scale(${scaleX.toFixed(4)} ${scaleY.toFixed(4)})`);

      const pxSize = item.size * sizeFactor;
      const half = pxSize / 2;
      useEl.setAttribute('x', (-half).toFixed(2));
      useEl.setAttribute('y', (-half).toFixed(2));
      useEl.setAttribute('width', pxSize.toFixed(2));
      useEl.setAttribute('height', pxSize.toFixed(2));
    });
  }

  function setIconsRestingState(staffMode) {
    syncIconsViewportMetrics();
    fluidIconNodes.forEach(({ item, posEl, rotEl }) => {
      const { x, y, rot } = getIconTargetCoords(item, staffMode);
      if (typeof window.gsap !== 'undefined') {
        gsap.set(posEl, { x, y });
        gsap.set(rotEl, { rotation: rot, svgOrigin: '0 0' });
      } else {
        posEl.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
        rotEl.setAttribute('transform', `rotate(${rot})`);
      }
    });
  }

  function renderRestingFluidState(staffMode) {
    if (creamDropletsGroup) creamDropletsGroup.innerHTML = '';
    if (darkTrailingBlobsGroup) darkTrailingBlobsGroup.innerHTML = '';
    if (creamFluidMainPath) creamFluidMainPath.setAttribute('d', '');
    if (darkBridgePath) darkBridgePath.setAttribute('d', '');

    if (isMobileViewport()) {
      const yVec = WAVE_CONFIG.MOBILE_REST_Y;
      if (darkFluidMainPath) {
        darkFluidMainPath.setAttribute('d', buildVerticalRegionPath(yVec, 'bottom'));
      }
      if (waveBoundaryStrokePath) {
        waveBoundaryStrokePath.setAttribute('d', buildHorizontalWaveCurve(yVec));
      }
      return;
    }

    const restX = getRestingWaveX(staffMode);
    const anchor = staffMode ? 'left' : 'right';
    if (darkFluidMainPath) {
      darkFluidMainPath.setAttribute('d', buildHorizontalRegionPath(restX, anchor));
    }
    if (waveBoundaryStrokePath) {
      waveBoundaryStrokePath.setAttribute('d', buildVerticalWaveCurve(restX));
    }
  }

  /**
   * ==========================================================================
   * 3. PHASE 1 & PHASE 3 DYNAMIC WAVE + DROPLET FRAME COMPUTATION
   * ==========================================================================
   */

  /**
   * Phase 1 (Flood): Computes the advancing Dark Fluid wave edge as it expands
   * across the entire screen (0 -> 1).
   * - Middle of the curve leads; top and bottom lag behind; continuous wobble.
   */
  function renderPhase1FloodFrame(progress, toStaff, mobileMode) {
    const weights = WAVE_CONFIG.CENTER_LEAD_WEIGHTS;

    if (mobileMode) {
      // Mobile: Dark fluid floods UP from bottom to top (y = -45)
      const startY = 880;
      const endY = -45;
      const yVec = new Array(10);

      for (let i = 0; i < 10; i++) {
        const w = weights[i];
        // Center leads faster than corners
        const localP = Math.min(1, Math.pow(progress, 1 - 0.35 * w));
        const base = lerp(startY, endY, localP);
        const bow = -95 * Math.sin(progress * Math.PI) * w;
        const wobble = Math.sin(progress * Math.PI * 3 + i * 0.85) * 18 * (1 - progress);
        yVec[i] = base + bow + wobble;
      }

      if (darkFluidMainPath) {
        darkFluidMainPath.setAttribute('d', buildVerticalRegionPath(yVec, 'bottom'));
      }
      if (waveBoundaryStrokePath) {
        waveBoundaryStrokePath.setAttribute('d', buildHorizontalWaveCurve(yVec));
      }
      return;
    }

    // Desktop & Tablet:
    // If toStaff (Guest -> Staff): Dark fluid starts on RIGHT (GUEST_REST_X) & floods LEFT to x = -45
    // If !toStaff (Staff -> Guest): Dark fluid starts on LEFT (STAFF_REST_X) & floods RIGHT to x = 1045
    const startVec = getRestingWaveX(!toStaff);
    const targetWallX = toStaff ? -45 : 1045;
    const dir = toStaff ? -1 : 1;
    const anchor = toStaff ? 'right' : 'left';
    const xVec = new Array(10);

    for (let i = 0; i < 10; i++) {
      const w = weights[i];
      // Center leads; top and bottom corners lag behind
      const localP = Math.min(1, Math.pow(progress, 1.18 - 0.48 * w));
      const base = lerp(startVec[i], targetWallX, localP);
      const centerBow = dir * WAVE_CONFIG.FLOOD_CENTER_BOW * Math.sin(progress * Math.PI) * w;
      const wobble =
        Math.sin(progress * Math.PI * 3.2 + i * 0.75) *
        WAVE_CONFIG.FLOOD_WOBBLE_AMP *
        (1 - progress * 0.85);
      xVec[i] = base + centerBow + wobble;
    }

    if (darkFluidMainPath) {
      darkFluidMainPath.setAttribute('d', buildHorizontalRegionPath(xVec, anchor));
    }
    if (waveBoundaryStrokePath) {
      waveBoundaryStrokePath.setAttribute('d', buildVerticalWaveCurve(xVec));
    }
  }

  /**
   * Ensures SVG <path> nodes exist inside the droplet groups for Phase 3
   */
  function ensureDropletElements(dropletsArray) {
    if (!creamDropletsGroup || !darkTrailingBlobsGroup) return { creamEls: [], darkEls: [] };
    creamDropletsGroup.innerHTML = '';
    darkTrailingBlobsGroup.innerHTML = '';

    const creamEls = [];
    const darkEls = [];

    dropletsArray.forEach((d) => {
      const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      if (d.type === 'cream-lead') {
        pathEl.setAttribute('class', 'droplet-cream');
        creamDropletsGroup.appendChild(pathEl);
        creamEls.push({ data: d, el: pathEl });
      } else {
        pathEl.setAttribute('class', 'droplet-dark');
        darkTrailingBlobsGroup.appendChild(pathEl);
        darkEls.push({ data: d, el: pathEl });
      }
    });

    return { creamEls, darkEls };
  }

  /**
   * Phase 3 (Cream Returns with Droplets & Settles):
   * - Cream enters from the opposite edge (RIGHT for Guest->Staff; LEFT for Staff->Guest;
   *   TOP for Mobile) and pushes the dark green back to its final resting position.
   * - Leading cream droplets appear ahead of the cream edge inside the dark area.
   * - Trailing dark green blobs stay inside the cream area for a moment and slowly
   *   shrink and merge back into the dark side via the SVG gooey filter.
   * - Settles with a small overshoot and rest.
   */
  function renderPhase3ReturnFrame(progress, toStaff, mobileMode, dropletNodes) {
    const weights = WAVE_CONFIG.CENTER_LEAD_WEIGHTS;

    // Smooth arrival curve with a small overshoot and settle at the end
    const baseEase = 1 - Math.pow(1 - progress, 3);
    const settlePhase = progress > 0.55 ? (progress - 0.55) / 0.45 : 0;
    const dampedOvershoot =
      settlePhase > 0
        ? Math.exp(-4.2 * settlePhase) *
          Math.sin(settlePhase * Math.PI * 2.2) *
          (1 - Math.pow(settlePhase, 2))
        : 0;

    if (mobileMode) {
      // Mobile: Cream enters from TOP (y=-40), pushes dark down to y≈240, then settles to MOBILE_REST_Y
      const restY = WAVE_CONFIG.MOBILE_REST_Y;
      const yVec = new Array(10);

      for (let i = 0; i < 10; i++) {
        const w = weights[i];
        const pushDepth = Math.sin(progress * Math.PI) * 240 * (0.65 + 0.35 * w);
        const overshoot = dampedOvershoot * 28 * w;
        yVec[i] = lerp(-35, restY[i], baseEase) + pushDepth + overshoot;
      }

      const darkPathStr = buildVerticalRegionPath(yVec, 'bottom');
      const creamPathStr = buildVerticalRegionPath(yVec, 'top');

      if (darkFluidMainPath) darkFluidMainPath.setAttribute('d', darkPathStr);
      if (darkBridgePath) darkBridgePath.setAttribute('d', darkPathStr);
      if (creamFluidMainPath) creamFluidMainPath.setAttribute('d', creamPathStr);
      if (waveBoundaryStrokePath) {
        waveBoundaryStrokePath.setAttribute('d', buildHorizontalWaveCurve(yVec));
      }

      // Update Mobile Droplets (3-4 droplets)
      const midEdgeY = yVec[4];
      dropletNodes.creamEls.forEach(({ data, el }, idx) => {
        const localT = Math.max(0, Math.min(1, (progress - data.delay) * data.speed * 1.35));
        if (localT <= 0 || localT >= 0.92) {
          el.setAttribute('d', '');
          return;
        }
        const env = Math.sin((localT / 0.92) * Math.PI);
        const cy = midEdgeY + data.dist * env;
        const cx = data.pos + Math.sin(localT * Math.PI * 2 + idx) * 14;
        el.setAttribute(
          'd',
          buildIrregularDropletPath(cx, cy, data.rx * env, data.ry * env, data.skew, localT * 6)
        );
      });

      dropletNodes.darkEls.forEach(({ data, el }, idx) => {
        const localT = Math.max(0, Math.min(1, (progress - data.delay) * data.speed * 1.25));
        if (localT <= 0 || localT >= 0.95) {
          el.setAttribute('d', '');
          return;
        }
        const shrink = Math.sin((localT / 0.95) * Math.PI);
        const pullBack = 1 - localT / 0.95;
        const cy = midEdgeY - data.dist * shrink * pullBack;
        const cx = data.pos + Math.cos(localT * Math.PI * 2 + idx) * 12;
        el.setAttribute(
          'd',
          buildIrregularDropletPath(cx, cy, data.rx * shrink, data.ry * shrink, data.skew, localT * 5)
        );
      });
      return;
    }

    // Desktop & Tablet:
    // If toStaff (Guest -> Staff): Cream enters from RIGHT (1045) & pushes LEFT to STAFF_REST_X (~560)
    // If !toStaff (Staff -> Guest): Cream enters from LEFT (-45) & pushes RIGHT to GUEST_REST_X (~440)
    const startWallX = toStaff ? 1045 : -45;
    const finalRestVec = getRestingWaveX(toStaff);
    const pushDir = toStaff ? -1 : 1; // Direction Cream is pushing
    const darkAnchor = toStaff ? 'left' : 'right';
    const creamAnchor = toStaff ? 'right' : 'left';
    const xVec = new Array(10);

    for (let i = 0; i < 10; i++) {
      const w = weights[i];
      const localEase = 1 - Math.pow(1 - Math.min(1, progress * (0.92 + 0.16 * w)), 3);
      const base = lerp(startWallX, finalRestVec[i], localEase);

      // Middle of the cream curve leads slightly as it pushes
      const leadBow =
        pushDir *
        WAVE_CONFIG.RETURN_CENTER_BOW *
        Math.sin(Math.min(1, progress / 0.78) * Math.PI) *
        (0.35 + 0.65 * w) *
        (1 - progress * 0.7);

      // Small overshoot and settle at the end
      const settleOffset =
        pushDir * WAVE_CONFIG.SETTLE_OVERSHOOT_AMP * dampedOvershoot * (0.4 + 0.6 * w);

      xVec[i] = base + leadBow + settleOffset;
    }

    const darkPathStr = buildHorizontalRegionPath(xVec, darkAnchor);
    const creamPathStr = buildHorizontalRegionPath(xVec, creamAnchor);

    if (darkFluidMainPath) darkFluidMainPath.setAttribute('d', darkPathStr);
    if (darkBridgePath) darkBridgePath.setAttribute('d', darkPathStr);
    if (creamFluidMainPath) creamFluidMainPath.setAttribute('d', creamPathStr);
    if (waveBoundaryStrokePath) {
      waveBoundaryStrokePath.setAttribute('d', buildVerticalWaveCurve(xVec));
    }

    // Helper to sample the wave's X coordinate at any vertical Y (0..1000)
    const sampleWaveXAtY = (y) => {
      const idxFloat = Math.max(0, Math.min(9, (y / 1000) * 9));
      const idxLow = Math.floor(idxFloat);
      const idxHigh = Math.min(9, idxLow + 1);
      return lerp(xVec[idxLow], xVec[idxHigh], idxFloat - idxLow);
    };

    // 1. Update Leading Cream Droplets (ahead of the cream wave inside the dark area)
    dropletNodes.creamEls.forEach(({ data, el }, idx) => {
      const localT = Math.max(0, Math.min(1, (progress - data.delay) * data.speed * 1.45));
      if (localT <= 0 || localT >= 0.88) {
        el.setAttribute('d', '');
        return;
      }
      // Bell envelope: droplet emerges ahead of wave, stretches, and is absorbed as wave catches up
      const lifeEnv = Math.sin((localT / 0.88) * Math.PI);
      const edgeX = sampleWaveXAtY(data.pos);
      const leadOffset = pushDir * data.dist * lifeEnv * (1 - localT * 0.45);
      const cx = edgeX + leadOffset;
      const cy = data.pos + Math.sin(localT * Math.PI * 2.5 + idx) * 16;
      const rx = data.rx * (0.55 + 0.65 * lifeEnv);
      const ry = data.ry * (0.5 + 0.55 * lifeEnv);

      el.setAttribute(
        'd',
        buildIrregularDropletPath(cx, cy, rx, ry, data.skew, localT * 6 + idx)
      );
    });

    // 2. Update Trailing Dark Green Blobs (inside the cream area behind the edge, shrinking & merging back)
    dropletNodes.darkEls.forEach(({ data, el }, idx) => {
      const localT = Math.max(0, Math.min(1, (progress - data.delay) * data.speed * 1.32));
      if (localT <= 0 || localT >= 0.94) {
        el.setAttribute('d', '');
        return;
      }
      // Starts inside the cream zone (opposite of pushDir), lingers, then shrinks & pulls back into dark edge
      const norm = localT / 0.94;
      const sizeScale = Math.sin(norm * Math.PI) * (1 - norm * 0.35);
      const pullBackFactor = Math.sin(norm * Math.PI * 0.85) * (1 - Math.pow(norm, 1.6));
      const edgeX = sampleWaveXAtY(data.pos);
      const trailOffset = -pushDir * data.dist * pullBackFactor;
      const cx = edgeX + trailOffset;
      const cy = data.pos + Math.cos(localT * Math.PI * 2 + idx) * 14;
      const rx = data.rx * sizeScale;
      const ry = data.ry * sizeScale;

      el.setAttribute(
        'd',
        buildIrregularDropletPath(cx, cy, rx, ry, data.skew, localT * 5 + idx)
      );
    });
  }

  /**
   * ==========================================================================
   * 4. ACTIVE PANE RESOLUTION, SMOOTH IN-CARD HEIGHT & FOCUS MANAGEMENT
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

  function setInteractiveControlsDisabled(disabled) {
    const controls = [
      sideSwitchBtn,
      mobileSideSwitchBtn,
      staffRoleOperatorBtn,
      staffRoleAdminBtn,
      tabBtnLogin,
      tabBtnRegister,
      document.getElementById('belowCardSwitchTabBtn')
    ];
    controls.forEach((btn) => {
      if (btn) btn.disabled = disabled;
    });
  }

  /**
   * Synchronizes all headings, specific human copy, tabs & switch buttons
   */
  function syncCardControlsUI() {
    const currentTab = !isStaffMode ? activeGuestTab : activeOperatorTab;

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
   * 5. GSAP SINGLE-TIMELINE 3-PHASE FLUID FLOOD, HOLD & CREAM DROPLET RETURN
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

  /**
   * Performs the hidden DOM swap when the screen is 100% covered in Phase 2
   */
  function applyHiddenDomSwap(targetStaffMode) {
    isStaffMode = targetStaffMode;
    loginStage.classList.toggle('is-staff-mode', targetStaffMode);
    syncCardControlsUI();

    const activeKey = getTargetPaneKey();
    Object.entries(panes).forEach(([k, p]) => {
      if (!p) return;
      p.hidden = k !== activeKey;
      p.classList.toggle('is-active-pane', k === activeKey);
    });
    if (cardDynamicViewport) cardDynamicViewport.style.height = '';
  }

  function setInitialLoginMode(staffMode) {
    applyHiddenDomSwap(staffMode);
    renderRestingFluidState(staffMode);
    setIconsRestingState(staffMode);
    syncUrlHash(staffMode, true);
    focusFirstActiveField();
  }

  /**
   * Builds and runs the single GSAP timeline for all 3 phases:
   *   - PHASE 1: FLOOD (0 to ~0.90s)
   *   - PHASE 2: HOLD & HIDDEN DOM SWAP (~0.90s to ~1.00s)
   *   - PHASE 3: CREAM RETURNS WITH GOOEY DROPLETS & SETTLE (~1.00s to ~2.10s)
   *   - FLOATING ICONS: Animated continuously in the same timeline using only
   *     transform (x, y, rotation) with per-icon lag, depth parallax, and settle.
   */
  function triggerModeSwitch(targetStaffMode, updateHash = true) {
    if (isAnimating || targetStaffMode === isStaffMode) return;

    isAnimating = true;
    loginStage.classList.add('is-animating');
    setInteractiveControlsDisabled(true);
    hideCardBanner();
    clearAllFieldErrors();

    if (updateHash) {
      syncUrlHash(targetStaffMode, false);
    }

    // Reduced-motion fallback: skip fluid effect and do a simple 0.3s crossfade
    if (prefersReducedMotion() || typeof window.gsap === 'undefined') {
      const fadeMs = TIMING_REDUCED_MOTION * 1000;
      if (welcomeContentInner) welcomeContentInner.style.opacity = '0';
      if (fluidFormWrapper) fluidFormWrapper.style.opacity = '0';

      setTimeout(() => {
        applyHiddenDomSwap(targetStaffMode);
        renderRestingFluidState(targetStaffMode);
        setIconsRestingState(targetStaffMode);
        if (welcomeContentInner) welcomeContentInner.style.opacity = '1';
        if (fluidFormWrapper) fluidFormWrapper.style.opacity = '1';
        loginStage.classList.remove('is-animating');
        setInteractiveControlsDisabled(false);
        isAnimating = false;
        focusFirstActiveField();
      }, fadeMs);
      return;
    }

    const mobileMode = isMobileViewport();
    const dropletsData = mobileMode ? MOBILE_DROPLETS_DATA : DESKTOP_DROPLETS_DATA;
    const dropletNodes = ensureDropletElements(dropletsData);
    syncIconsViewportMetrics();

    const proxy = {
      floodProgress: 0,
      returnProgress: 0
    };

    const slideDist = targetStaffMode ? -24 : 24;

    if (activeTimeline) {
      activeTimeline.kill();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        renderRestingFluidState(targetStaffMode);
        setIconsRestingState(targetStaffMode);
        gsap.set([fluidFormWrapper, welcomeContentInner], { clearProps: 'transform,opacity' });
        loginStage.classList.remove('is-animating');
        setInteractiveControlsDisabled(false);
        isAnimating = false;
        activeTimeline = null;
        focusFirstActiveField();
      }
    });

    activeTimeline = tl;

    // ------------------------------------------------------------------------
    // PHASE 1: FLOOD (0 to ~0.90s)
    // - First 0.2s: Form card and cream-side welcome text fade out & slide away
    // - Dark green fluid expands across the screen with a wavy leading edge
    // ------------------------------------------------------------------------
    tl.to(
      [fluidFormWrapper, welcomeContentInner],
      {
        opacity: 0,
        x: mobileMode ? 0 : slideDist,
        y: mobileMode ? -18 : 0,
        duration: TIMING_CARD_FADE_OUT,
        ease: 'power2.in'
      },
      0
    );

    tl.to(
      proxy,
      {
        floodProgress: 1,
        duration: TIMING_PHASE1_FLOOD,
        ease: 'power2.inOut',
        onUpdate: () => {
          renderPhase1FloodFrame(proxy.floodProgress, targetStaffMode, mobileMode);
        }
      },
      0.05
    );

    // ------------------------------------------------------------------------
    // PHASE 2: HOLD (~0.90s to ~1.00s)
    // - Whole screen is solid dark green.
    // - Swap the DOM content & panel sides invisibly while covered.
    // ------------------------------------------------------------------------
    const phase2Start = 0.05 + TIMING_PHASE1_FLOOD;

    tl.call(
      () => {
        applyHiddenDomSwap(targetStaffMode);
        // Pre-position incoming card & welcome text slightly below for upward fade-in
        gsap.set([fluidFormWrapper, welcomeContentInner], {
          opacity: 0,
          x: 0,
          y: 18
        });
      },
      null,
      phase2Start + TIMING_PHASE2_HOLD * 0.5
    );

    // ------------------------------------------------------------------------
    // PHASE 3: CREAM RETURNS WITH DROPLETS & SETTLES (~1.00s to ~2.10s)
    // - Cream enters from the opposite edge with leading cream droplets and
    //   trailing dark green blobs, settling into the final wavy shape.
    // - Card and welcome text fade in (0.3s, small upward slide) once settled.
    // ------------------------------------------------------------------------
    const phase3Start = phase2Start + TIMING_PHASE2_HOLD;
    const totalFluidEnd = phase3Start + TIMING_PHASE3_RETURN;

    tl.to(
      proxy,
      {
        returnProgress: 1,
        duration: TIMING_PHASE3_RETURN,
        ease: 'none',
        onUpdate: () => {
          renderPhase3ReturnFrame(
            proxy.returnProgress,
            targetStaffMode,
            mobileMode,
            dropletNodes
          );
        }
      },
      phase3Start
    );

    // ------------------------------------------------------------------------
    // CONTINUOUS FLOATING ICONS MOTION (In the same GSAP timeline `tl`)
    // - Animated using ONLY transform (x, y, rotation) with position offsets.
    // - Lag (0 to 150ms), parallax depth (0.6 to 1.4), travel rotation
    //   (-12 to +12 deg), overshoot, and soft settle into final resting places.
    // ------------------------------------------------------------------------
    fluidIconNodes.forEach((node, idx) => {
      const { item, posEl, rotEl } = node;
      if (mobileMode && !item.mobile) return;

      const fromCoords = getIconTargetCoords(item, !targetStaffMode);
      const toCoords = getIconTargetCoords(item, targetStaffMode);

      const delay = item.lagMs; // 0.00s to 0.15s lag behind fluid edge
      const depth = item.depth; // 0.60 to 1.40 parallax depth
      const startAt = 0.05 + delay;

      // Higher depth travels slightly faster and further than lower depth
      const speedFactor = 0.84 + (depth - 0.6) * 0.36;
      const moveDur = Math.min(
        totalFluidEnd - startAt - 0.26,
        (TIMING_PHASE1_FLOOD + TIMING_PHASE2_HOLD + TIMING_PHASE3_RETURN * 0.64) / speedFactor
      );
      const settleDur = Math.max(0.26, totalFluidEnd - (startAt + moveDur));

      if (mobileMode) {
        // Mobile vertical travel: surge UP with Phase 1 flood, then push DOWN & settle in Phase 3
        const floodDur = TIMING_PHASE1_FLOOD * (0.95 - (depth - 0.6) * 0.15);
        const returnDur = Math.max(0.32, totalFluidEnd - (startAt + floodDur) - 0.24);
        const mobileSettleDur = Math.max(0.24, totalFluidEnd - (startAt + floodDur + returnDur));

        const surgeY = fromCoords.y - (80 + 55 * depth);
        const surgeX = fromCoords.x + (idx % 2 === 0 ? 1 : -1) * 18 * depth;
        const overshootY = toCoords.y + (18 + 22 * depth);
        const overshootX = toCoords.x + (idx % 2 === 0 ? -1 : 1) * 8 * depth;

        tl.to(
          posEl,
          {
            x: surgeX,
            y: surgeY,
            duration: floodDur,
            ease: 'power2.inOut'
          },
          startAt
        );

        tl.to(
          posEl,
          {
            x: overshootX,
            y: overshootY,
            duration: returnDur,
            ease: 'power2.out'
          },
          startAt + floodDur
        );

        tl.to(
          posEl,
          {
            x: toCoords.x,
            y: toCoords.y,
            duration: mobileSettleDur,
            ease: 'sine.inOut'
          },
          startAt + floodDur + returnDur
        );
      } else {
        // Desktop & Tablet horizontal travel:
        // Continuous glide across screen -> depth-scaled overshoot -> settle to rest
        const dirX = targetStaffMode ? -1 : 1;
        const overshootX = toCoords.x + dirX * (15 + 24 * depth);
        const driftY = (idx % 2 === 0 ? -1 : 1) * (10 + 12 * depth);
        const overshootY = toCoords.y + driftY;

        tl.to(
          posEl,
          {
            x: overshootX,
            y: overshootY,
            duration: moveDur,
            ease: 'power2.inOut'
          },
          startAt
        );

        tl.to(
          posEl,
          {
            x: toCoords.x,
            y: toCoords.y,
            duration: settleDur,
            ease: 'sine.inOut'
          },
          startAt + moveDur
        );
      }

      // Rotation while travelling (-12 to +12 deg) -> returns close to resting angle
      const rotDir = targetStaffMode ? 1 : -1;
      const peakRot = fromCoords.rot + rotDir * item.travelRot;
      const rotPeakDur = moveDur * 0.68;
      const rotSettleDur = moveDur * 0.32 + settleDur;

      tl.to(
        rotEl,
        {
          rotation: peakRot,
          svgOrigin: '0 0',
          duration: rotPeakDur,
          ease: 'sine.inOut'
        },
        startAt
      );

      tl.to(
        rotEl,
        {
          rotation: toCoords.rot,
          svgOrigin: '0 0',
          duration: rotSettleDur,
          ease: 'back.out(1.35)'
        },
        startAt + rotPeakDur
      );
    });

    tl.to(
      [fluidFormWrapper, welcomeContentInner],
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: TIMING_CARD_FADE_IN,
        ease: 'power2.out'
      },
      phase3Start + TIMING_PHASE3_RETURN - 0.22
    );
  }

  // Bind Desktop/Tablet and Mobile mode switch buttons
  sideSwitchBtn?.addEventListener('click', () => triggerModeSwitch(!isStaffMode, true));
  mobileSideSwitchBtn?.addEventListener('click', () => triggerModeSwitch(!isStaffMode, true));

  // If the user presses Back/Forward in the browser during the animation,
  // finish the timeline instantly and then update the state.
  window.addEventListener('hashchange', () => {
    const hashWantsStaff = window.location.hash.toLowerCase() === '#staff';
    if (activeTimeline && activeTimeline.isActive()) {
      activeTimeline.progress(1).kill();
      activeTimeline = null;
      isAnimating = false;
      loginStage.classList.remove('is-animating');
      setInteractiveControlsDisabled(false);
    }
    if (hashWantsStaff !== isStaffMode) {
      setInitialLoginMode(hashWantsStaff);
    }
  });

  // Keep resting wave and floating icons crisp on window resize when not animating
  window.addEventListener('resize', () => {
    if (!isAnimating) {
      renderRestingFluidState(isStaffMode);
      setIconsRestingState(isStaffMode);
    } else {
      syncIconsViewportMetrics();
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
   * 6. SHOW / HIDE PASSWORD TOGGLES
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
   * 7. INLINE FIELD VALIDATION, CARD SHAKE & BUTTON LOADING STATE
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
   * 8. FORM SUBMISSIONS (Guest Login/Register, Operator Login/Register, Admin)
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
  document.querySelectorAll('.social-auth-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const provider = btn.getAttribute('data-social-provider') || 'Social';
      const href = btn.getAttribute('href') || '';

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
        } catch (err) {}
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
