/**
 * ============================================================================
 * e-Homestay PERDA (Inap Desa) - Core Application Script (main.js)
 * Contains realistic Malaysian PERDA homestay data, shared state (localStorage),
 * mobile sidebar toggles, notification bell logic, and toast alerts.
 * ============================================================================
 */

const PERDA_PALETTE = {
  olive: '#606C38',
  darkGreen: '#283618',
  cream: '#FEFAE0',
  sand: '#DDA15E',
  burntOrange: '#BC6C25',
  white: '#FFFFFF',
  grey: '#C8C8C0'
};

/**
 * 1. REALISTIC SAMPLE DATA: Malaysian PERDA Homestays (Penang Rural Districts)
 */
const DEFAULT_HOMESTAYS = [
  {
    id: 'hs-101',
    name: 'Inap Desa Kampung Agung Harmoni',
    district: 'Seberang Perai Utara (Kepala Batas)',
    shortDistrict: 'Kepala Batas',
    location: 'Kampung Agung, 13200 Kepala Batas, Pulau Pinang',
    pricePerNight: 220,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    rating: 4.9,
    reviewsCount: 48,
    operatorName: 'Haji Ismail bin Ahmad',
    operatorEmail: 'ismail.agung@homestayperda.my',
    image: 'images/homestay-1.svg',
    gallery: ['images/homestay-1.svg', 'images/homestay-2.svg', 'images/homestay-6.svg'],
    facilities: ['Free Wi-Fi', 'Air Conditioning', 'Halal Kitchen', 'Paddy Field View', 'Free Bicycles', 'Private Parking'],
    description: 'Experience authentic northern Malay village living surrounded by golden paddy fields in Kampung Agung, Kepala Batas. Built with traditional timber craftsmanship and modern comforts, ideal for families seeking serene rural charm.',
    blockedDates: ['2026-11-10', '2026-11-11', '2026-11-18', '2026-11-24', '2026-11-25']
  },
  {
    id: 'hs-102',
    name: 'Teratak Dusun Mengkuang Titi',
    district: 'Seberang Perai Tengah (Kubang Semang)',
    shortDistrict: 'Kubang Semang',
    location: 'Kampung Mengkuang Titi, 14000 Bukit Mertajam, Pulau Pinang',
    pricePerNight: 185,
    maxGuests: 5,
    bedrooms: 2,
    bathrooms: 2,
    rating: 4.8,
    reviewsCount: 36,
    operatorName: 'Puan Siti Hajar binti Mansor',
    operatorEmail: 'operator@homestayperda.my',
    image: 'images/homestay-2.svg',
    gallery: ['images/homestay-2.svg', 'images/homestay-1.svg', 'images/homestay-3.svg'],
    facilities: ['Tropical Fruit Orchard', 'Air Conditioning', 'BBQ Pit', 'Free Wi-Fi', 'Halal Kitchen', 'Washing Machine'],
    description: 'Nestled within a lush tropical fruit orchard near Mengkuang Dam, Teratak Dusun offers cool morning breezes, seasonal local fruits, and hands-on cultural activities curated by the Mengkuang Titi homestay community.',
    blockedDates: ['2026-11-08', '2026-11-09', '2026-11-21']
  },
  {
    id: 'hs-103',
    name: 'Anjung Bendang Pulau Betong',
    district: 'Barat Daya (Balik Pulau)',
    shortDistrict: 'Balik Pulau',
    location: 'Kampung Pulau Betong, 11000 Balik Pulau, Pulau Pinang',
    pricePerNight: 260,
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 3,
    rating: 4.95,
    reviewsCount: 62,
    operatorName: 'Encik Roslan bin Kassim',
    operatorEmail: 'roslan.betong@homestayperda.my',
    image: 'images/homestay-3.svg',
    gallery: ['images/homestay-3.svg', 'images/homestay-4.svg', 'images/homestay-1.svg'],
    facilities: ['Hill & Countryside View', 'Spacious Verandah', 'Air Conditioning', 'Halal Kitchen', 'Free Wi-Fi', 'Gazebo'],
    description: 'A spacious heritage-inspired country residence in Balik Pulau featuring a wide wooden verandah, nutmeg orchard trails, and easy access to Kuala Sungai Burung fishing village.',
    blockedDates: ['2026-11-14', '2026-11-15', '2026-11-28']
  },
  {
    id: 'hs-104',
    name: 'Villa Muara Sungai Acheh',
    district: 'Seberang Perai Selatan (Nibong Tebal)',
    shortDistrict: 'Nibong Tebal',
    location: 'Kampung Sungai Acheh, 14320 Nibong Tebal, Pulau Pinang',
    pricePerNight: 195,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    rating: 4.7,
    reviewsCount: 29,
    operatorName: 'Encik Kamarul Zaman',
    operatorEmail: 'kamarul@homestayperda.my',
    image: 'images/homestay-4.svg',
    gallery: ['images/homestay-4.svg', 'images/homestay-5.svg', 'images/homestay-2.svg'],
    facilities: ['Riverfront Breeze', 'Firefly Boat Tour Info', 'Air Conditioning', 'Halal Kitchen', 'Free Parking', 'Wi-Fi'],
    description: 'Located near the tranquil Kerian River estuary and vibrant fishing community of Sungai Acheh. Guests enjoy fresh seafood dining nearby and evening firefly river cruises.',
    blockedDates: ['2026-11-12', '2026-11-19', '2026-11-20']
  },
  {
    id: 'hs-105',
    name: 'Desa Damai Chalet Pulau Aman',
    district: 'Seberang Perai Selatan (Simpang Ampat)',
    shortDistrict: 'Pulau Aman',
    location: 'Kampung Pulau Aman, 14100 Simpang Ampat, Pulau Pinang',
    pricePerNight: 240,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 1,
    rating: 4.85,
    reviewsCount: 41,
    operatorName: 'Puan Noraini binti Saad',
    operatorEmail: 'noraini@homestayperda.my',
    image: 'images/homestay-5.svg',
    gallery: ['images/homestay-5.svg', 'images/homestay-3.svg', 'images/homestay-4.svg'],
    facilities: ['Island Sea View', 'Car-Free Eco Village', 'Air Conditioning', 'Kayak & Fishing Info', 'Wi-Fi', 'Breakfast Option'],
    description: 'Escape city traffic on peaceful Pulau Aman, famous for its golden breadfruit trees (Pokok Sukun) and legendary Mee Udang by the sea.',
    blockedDates: ['2026-11-16', '2026-11-17', '2026-11-29']
  },
  {
    id: 'hs-106',
    name: 'Laman Agro Lahar Yooi',
    district: 'Seberang Perai Utara (Tasek Gelugor)',
    shortDistrict: 'Tasek Gelugor',
    location: 'Kampung Lahar Yooi, 13300 Tasek Gelugor, Pulau Pinang',
    pricePerNight: 170,
    maxGuests: 5,
    bedrooms: 2,
    bathrooms: 2,
    rating: 4.75,
    reviewsCount: 33,
    operatorName: 'Encik Azman bin Daud',
    operatorEmail: 'azman@homestayperda.my',
    image: 'images/homestay-6.svg',
    gallery: ['images/homestay-6.svg', 'images/homestay-1.svg', 'images/homestay-2.svg'],
    facilities: ['Agro-Tourism Garden', 'Air Conditioning', 'Halal Kitchen', 'Free Wi-Fi', 'Family BBQ Area', 'Ample Parking'],
    description: 'Cozy village stay in Tasek Gelugor offering stingless bee (Kelulut) honey farm visits, green paddy vistas, and warm northern hospitality.',
    blockedDates: ['2026-11-07', '2026-11-22', '2026-11-23']
  }
];

/**
 * 2. REALISTIC SAMPLE BOOKINGS (Used for Tracking, Operator Verification & Reports)
 */
const DEFAULT_BOOKINGS = [
  {
    ref: 'PERDA-2026-84920',
    homestayId: 'hs-101',
    homestayName: 'Inap Desa Kampung Agung Harmoni',
    district: 'Kepala Batas',
    guestName: 'Nurul Izzah binti Razak',
    guestPhone: '+60 12-489 3310',
    guestEmail: 'nurul.izzah@gmail.com',
    checkIn: '2026-11-14',
    checkOut: '2026-11-16',
    nights: 2,
    guests: 4,
    totalAmount: 440,
    specialRequests: 'Requesting ground floor bedroom for elderly parents and early check-in at 1:30 PM if available.',
    receiptFile: 'maybank2u_receipt_84920.png',
    receiptUrl: 'images/sample-receipt.svg',
    status: 'Pending',
    remainingSeconds: 68420, // ~19 hours left on 24h verification timer
    createdAt: '2026-11-06 07:15 AM'
  },
  {
    ref: 'PERDA-2026-73105',
    homestayId: 'hs-102',
    homestayName: 'Teratak Dusun Mengkuang Titi',
    district: 'Kubang Semang',
    guestName: 'Ahmad Firdaus bin Zainal',
    guestPhone: '+60 19-552 8104',
    guestEmail: 'firdaus.zainal@yahoo.com',
    checkIn: '2026-11-20',
    checkOut: '2026-11-23',
    nights: 3,
    guests: 5,
    totalAmount: 555,
    specialRequests: 'Would love to book the orchard guided tour on Saturday morning.',
    receiptFile: 'duitnow_transfer_73105.pdf',
    receiptUrl: 'images/sample-receipt.svg',
    status: 'Pending',
    remainingSeconds: 13850, // ~3 hrs 50 mins left (Urgent!)
    createdAt: '2026-11-05 04:02 PM'
  },
  {
    ref: 'PERDA-2026-61209',
    homestayId: 'hs-103',
    homestayName: 'Anjung Bendang Pulau Betong',
    district: 'Balik Pulau',
    guestName: 'Dr. Lim Wei Ming',
    guestPhone: '+60 16-411 9022',
    guestEmail: 'weiming.lim@usm.my',
    checkIn: '2026-11-10',
    checkOut: '2026-11-12',
    nights: 2,
    guests: 6,
    totalAmount: 520,
    specialRequests: 'Bringing 4 bicycles; need covered storage space overnight.',
    receiptFile: 'cimb_clicks_61209.jpg',
    receiptUrl: 'images/sample-receipt.svg',
    status: 'Approved',
    remainingSeconds: 0,
    createdAt: '2026-11-03 11:20 AM'
  },
  {
    ref: 'PERDA-2026-50844',
    homestayId: 'hs-105',
    homestayName: 'Desa Damai Chalet Pulau Aman',
    district: 'Pulau Aman',
    guestName: 'Farah Nadia binti Kamarudin',
    guestPhone: '+60 13-778 2190',
    guestEmail: 'farahnadia@outlook.com',
    checkIn: '2026-11-18',
    checkOut: '2026-11-20',
    nights: 2,
    guests: 4,
    totalAmount: 480,
    specialRequests: 'Need boat jetty schedule details from Batu Musang Jetty.',
    receiptFile: 'bank_islam_50844.png',
    receiptUrl: 'images/sample-receipt.svg',
    status: 'Approved',
    remainingSeconds: 0,
    createdAt: '2026-11-02 02:45 PM'
  },
  {
    ref: 'PERDA-2026-49012',
    homestayId: 'hs-104',
    homestayName: 'Villa Muara Sungai Acheh',
    district: 'Nibong Tebal',
    guestName: 'Syed Azman bin Syed Alwi',
    guestPhone: '+60 17-309 4412',
    guestEmail: 'syed.azman@gmail.com',
    checkIn: '2026-11-08',
    checkOut: '2026-11-09',
    nights: 1,
    guests: 6,
    totalAmount: 195,
    specialRequests: 'Late check-in around 8:00 PM.',
    receiptFile: 'unclear_screenshot_49012.jpg',
    receiptUrl: 'images/sample-receipt.svg',
    status: 'Rejected',
    rejectionReason: 'Uploaded receipt image was incomplete and transaction reference number did not match bank statement.',
    remainingSeconds: 0,
    createdAt: '2026-11-01 09:10 AM'
  },
  {
    ref: 'PERDA-2026-90318',
    homestayId: 'hs-106',
    homestayName: 'Laman Agro Lahar Yooi',
    district: 'Tasek Gelugor',
    guestName: 'Siti Sarah binti Halim',
    guestPhone: '+60 11-2844 6501',
    guestEmail: 'sitisarah.halim@gmail.com',
    checkIn: '2026-11-25',
    checkOut: '2026-11-27',
    nights: 2,
    guests: 5,
    totalAmount: 340,
    specialRequests: 'Interested in Kelulut honey tasting session.',
    receiptFile: 'rhb_now_90318.png',
    receiptUrl: 'images/sample-receipt.svg',
    status: 'Pending',
    remainingSeconds: 79200, // 22 hours left
    createdAt: '2026-11-06 10:05 AM'
  }
];

/**
 * 3. REGISTERED & VERIFIED OFFICIAL PERDA ADMINISTRATOR EMAILS (For Page 3 Login)
 */
const VERIFIED_ADMIN_ACCOUNTS = [
  {
    email: 'officer.bpe@perda.gov.my',
    name: 'Encik Mohd Hafiz bin Yusof (BPE Officer)',
    department: 'Bahagian Pembangunan Ekonomi (BPE) PERDA',
    verified: true
  },
  {
    email: 'admin@perda.gov.my',
    name: 'Puan Norliza binti Abdul Rahman (Senior Officer)',
    department: 'Unit Pelancongan Desa PERDA',
    verified: true
  },
  {
    email: 'arahman@perda.gov.my',
    name: 'Tuan Haji Abdul Rahman (Director BPE)',
    department: 'Ibu Pejabat PERDA Butterworth',
    verified: true
  }
];

/**
 * 1-to-1 Operator Ownership Directory:
 * Strictly 1 Operator owns 1 Homestay Unit.
 */
const REGISTERED_OPERATOR_ACCOUNTS = [
  {
    email: 'operator@homestayperda.my',
    name: 'Puan Siti Hajar binti Mansor',
    homestayId: 'hs-102',
    unitName: 'Teratak Dusun Mengkuang Titi'
  },
  {
    email: 'ismail.agung@homestayperda.my',
    name: 'Haji Ismail bin Ahmad',
    homestayId: 'hs-101',
    unitName: 'Inap Desa Kampung Agung Harmoni'
  },
  {
    email: 'roslan.betong@homestayperda.my',
    name: 'Encik Roslan bin Kassim',
    homestayId: 'hs-103',
    unitName: 'Anjung Bendang Pulau Betong'
  },
  {
    email: 'kamarul@homestayperda.my',
    name: 'Encik Kamarul Zaman',
    homestayId: 'hs-104',
    unitName: 'Villa Muara Sungai Acheh'
  },
  {
    email: 'noraini@homestayperda.my',
    name: 'Puan Noraini binti Saad',
    homestayId: 'hs-105',
    unitName: 'Desa Damai Chalet Pulau Aman'
  },
  {
    email: 'azman@homestayperda.my',
    name: 'Encik Azman bin Daud',
    homestayId: 'hs-106',
    unitName: 'Laman Agro Lahar Yooi'
  }
];

/**
 * 4. STATE HELPERS (Persists changes in localStorage for seamless multi-page experience)
 */
function getHomestays() {
  try {
    const saved = localStorage.getItem('perda_homestays_v2');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('localStorage read fallback', e);
  }
  return DEFAULT_HOMESTAYS;
}

function saveHomestays(list) {
  try {
    localStorage.setItem('perda_homestays_v2', JSON.stringify(list));
  } catch (e) {
    console.warn('localStorage write fallback', e);
  }
}

function getActiveOperator() {
  try {
    const savedEmail = localStorage.getItem('perda_active_operator_email');
    if (savedEmail) {
      const found = REGISTERED_OPERATOR_ACCOUNTS.find(
        (op) => op.email.toLowerCase() === savedEmail.toLowerCase()
      );
      if (found) return found;
    }
  } catch (e) {}
  return REGISTERED_OPERATOR_ACCOUNTS[0]; // Default: Puan Siti Hajar (hs-102)
}

function setActiveOperatorByEmail(email) {
  try {
    localStorage.setItem('perda_active_operator_email', email);
  } catch (e) {}
}

function getOperatorOwnedHomestay() {
  const activeOp = getActiveOperator();
  const units = getHomestays();
  return (
    units.find(
      (u) =>
        u.id === activeOp.homestayId ||
        u.operatorEmail.toLowerCase() === activeOp.email.toLowerCase()
    ) || units[0]
  );
}

function getBookings() {
  try {
    const saved = localStorage.getItem('perda_bookings_v1');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('localStorage read fallback', e);
  }
  return DEFAULT_BOOKINGS;
}

function saveBookings(list) {
  try {
    localStorage.setItem('perda_bookings_v1', JSON.stringify(list));
  } catch (e) {
    console.warn('localStorage write fallback', e);
  }
}

/**
 * 5. GLOBAL UI HELPERS: Toast Notifications, Sidebar Toggle & Notification Bell
 */
function showPerdaToast(title, message, iconClass = 'fa-circle-check') {
  let container = document.getElementById('perdaToastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'perdaToastContainer';
    container.className = 'perda-toast-container';
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'perda-toast';
  toast.innerHTML = `
    <i class="fa-solid ${iconClass} fs-4" style="color: var(--sand); margin-top: 2px;"></i>
    <div class="flex-grow-1">
      <div class="fw-bold" style="color: var(--cream); font-size: 0.92rem;">${title}</div>
      <div style="color: var(--cream); opacity: 0.9; font-size: 0.83rem;">${message}</div>
    </div>
    <button type="button" class="btn-close btn-close-white ms-2" aria-label="Close notification"></button>
  `;

  toast.querySelector('.btn-close').addEventListener('click', () => toast.remove());
  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 5500);
}

/**
 * Initialize Mobile Sidebar & Notification Bell on Dashboard/Verification/Reports pages
 */
document.addEventListener('DOMContentLoaded', () => {
  // Collapsible Dashboard Sidebar on Mobile
  const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
  const portalSidebar = document.getElementById('portalSidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');

  function closeSidebar() {
    if (portalSidebar) portalSidebar.classList.remove('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('show');
  }

  if (sidebarToggleBtn && portalSidebar) {
    sidebarToggleBtn.addEventListener('click', () => {
      portalSidebar.classList.toggle('open');
      if (sidebarBackdrop) sidebarBackdrop.classList.toggle('show');
    });
  }
  if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);

  // Notification Bell Dropdown Toggle (Page 4, 5, 6)
  const notifBellBtn = document.getElementById('notifBellBtn');
  const notifDropdownPanel = document.getElementById('notifDropdownPanel');
  if (notifBellBtn && notifDropdownPanel) {
    notifBellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = notifDropdownPanel.classList.toggle('show');
      notifBellBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('click', (e) => {
      if (!notifDropdownPanel.contains(e.target) && e.target !== notifBellBtn) {
        notifDropdownPanel.classList.remove('show');
        notifBellBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
});

