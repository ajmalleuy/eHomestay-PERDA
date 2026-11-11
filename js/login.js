/**
 * ============================================================================
 * e-Homestay PERDA (Inap Desa) - Split-Screen Login Script (login.js)
 * Manages:
 *   1. Default USER mode (Fluid panel RIGHT, Welcome panel LEFT)
 *   2. Staff ADMIN/OPERATOR mode (Fluid panel LEFT, Welcome panel RIGHT)
 *   3. Show/Hide Password toggle
 *   4. Tourist, Homestay Operator & Verified @perda.gov.my Officer validation
 *   5. "New here? Create an account" & "Forgot password?" modals
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginStage = document.getElementById('loginStage');
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
  let activeStaffSubRole = 'operator'; // 'operator' or 'officer'

  /**
   * Switch between USER mode (Default) and STAFF mode (Admin / Operator)
   */
  function applyLoginMode(staffMode) {
    isStaffMode = staffMode;
    hideError();

    if (isStaffMode) {
      loginStage.classList.add('is-staff-mode');
      loginStage.setAttribute('data-mode', 'staff');

      if (welcomeModePill) {
        welcomeModePill.innerHTML = '<i class="fa-solid fa-shield-halved" style="color: var(--burnt-orange);"></i> Staff &amp; Operator Access';
      }
      if (welcomeHeading) {
        welcomeHeading.textContent = 'PERDA Internal Management Portal';
      }
      if (welcomeSubtext) {
        welcomeSubtext.textContent = 'Manage your assigned homestay unit, verify incoming bookings, and generate official district reports.';
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
        belowCardPrompt.innerHTML = 'Need a tourist account instead? <button type="button" id="switchBackGuestInlineBtn">Switch to guest sign in</button>';
        document.getElementById('switchBackGuestInlineBtn')?.addEventListener('click', () => applyLoginMode(false));
      }
    } else {
      loginStage.classList.remove('is-staff-mode');
      loginStage.setAttribute('data-mode', 'user');

      if (welcomeModePill) {
        welcomeModePill.innerHTML = '<i class="fa-solid fa-leaf" style="color: var(--olive);"></i> Official PERDA Inap Desa';
      }
      if (welcomeHeading) {
        welcomeHeading.textContent = 'Welcome to Kampung Serenity';
      }
      if (welcomeSubtext) {
        welcomeSubtext.textContent = 'Discover and book authentic rural homestays across Penang’s peaceful villages.';
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
        belowCardPrompt.innerHTML = 'New here? <button type="button" data-bs-toggle="modal" data-bs-target="#createAccountModal">Create an account</button>';
      }
    }
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
      applyLoginMode(true);
    }
  }

  sideSwitchBtn?.addEventListener('click', () => {
    applyLoginMode(!isStaffMode);
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
   * Handle Login Submission for both USER mode and STAFF mode
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

  // Initialize in Default State = USER mode
  applyLoginMode(false);
});
