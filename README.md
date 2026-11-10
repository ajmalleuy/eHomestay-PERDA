# e-Homestay PERDA — Official Inap Desa Booking & Management Platform

A responsive, centralized web platform for searching, booking, and managing local **PERDA homestays (Inap Desa)** across Penang's rural districts.

---

## 1. Color Palette & Typography

Defined as CSS variables in `css/main.css`:

- `--olive: #606C38` — Primary buttons, links, icons, active states, available calendar dates
- `--dark-green: #283618` — Navbar, footer, headings, collapsible sidebar, main text
- `--cream: #FEFAE0` — Page background, cards, form backgrounds, high-contrast text on dark green
- `--sand: #DDA15E` — Secondary buttons, borders, highlights, badges, hover states
- `--burnt-orange: #BC6C25` — Call-to-action buttons (_Book Now_, _Search_), important alerts, selected calendar dates
- **Fonts**: `Playfair Display` (headings) and `Poppins` (body) via Google Fonts.

---

## 2. Project Directory Structure

```text
website 2/
├── index.html                  # Page 1: Tourist Landing, Search, Details, Availability Calendar & Registration
├── booking.html                # Page 2: Booking Form, 5MB Payment Proof Upload, Confirmation & Status Tracker
├── login.html                  # Page 3: Unified Operator & Verified BPE PERDA Officer Login
├── dashboard.html              # Page 4: Officer & Operator Dashboards, Unit Manager & Block Calendar Tool
├── verification.html           # Page 5: Operator Payment Verification, 24h Countdown Timer & Approval Modal
├── reports.html                # Page 6: BPE Officer Reports, Bar & Pie Charts, PDF & Excel Export
│
├── css/
│   ├── main.css                # Core CSS variables (--olive, --dark-green, --cream, --sand, --burnt-orange)
│   ├── landing.css             # Page 1 styles
│   ├── booking.css             # Page 2 styles
│   ├── login.css               # Page 3 styles
│   ├── dashboard.css           # Page 4 styles
│   ├── verification.css        # Page 5 styles
│   └── reports.css             # Page 6 styles
│
├── js/
│   ├── main.js                 # Realistic Malaysian PERDA homestay dataset, state persistence & UI helpers
│   ├── calendar.js             # Tourist Availability Calendar (Page 1) & Operator Block Calendar (Page 4)
│   ├── file-upload.js          # Payment proof upload (JPG/PNG/PDF only, max 5MB validation & preview)
│   ├── validation.js           # All form validations, 24h countdown timers & approval modal workflow
│   └── charts.js               # Booking trend chart, Bar & Pie charts, and PDF/Excel report exports
│
├── images/                     # Local SVG illustrations (PERDA logo, village hero, 6 homestays, receipt preview)
│
├── routes/
│   └── web.php                 # Laravel MVC web routes
├── app/
│   ├── Http/Controllers/       # HomeController, BookingController, AuthController, DashboardController, VerificationController, ReportController
│   └── Models/                 # User, Homestay, Booking, BlockedDate Eloquent models
├── database/
│   ├── migrations/             # MySQL schema migrations for users, homestays, bookings, and blocked_dates
│   └── seeders/                # DatabaseSeeder with realistic Malaysian PERDA homestay & booking records
├── resources/views/
│   ├── layouts/                # Master Blade layouts (app.blade.php, portal.blade.php)
│   ├── partials/               # Shared Blade partials (header.blade.php, sidebar.blade.php, footer.blade.php)
│   └── pages/                  # Separate Blade views for all 6 pages
├── Dockerfile                  # PHP 8.3-FPM container definition
├── docker-compose.yml          # Laravel + Nginx + MySQL 8.0 container orchestration
└── .env.example                # Environment configuration template
```

## 3. How to run

There are 3 ways to run and view the e-Homestay PERDA platform, depending on what you want to test:

Option 1: Instant Browser Preview (No Server Required — Fastest)

All 6 pages (index.html, booking.html, login.html, dashboard.html, verification.html, reports.html) are wired to work directly in your browser using local SVG images and localStorage.

Open a terminal and run:
powershell
Start-Process ".\index.html"
(Or simply double-click index.html in Windows File Explorer).
Use the top navigation bar ("e-Homestay Platform Pages: 1 to 6") at the very top of every page to jump between all 6 pages.
Option 2: Run with a Local Web Server (http://localhost:3000)

Since you have Node.js installed on your PC, you can serve the folder over HTTP:

Open your terminal in c:\DISC D\INTERNSHIP\PERDA\website 2 and run:
powershell
npx serve . -l 3000
Open http://localhost:3000
in your browser.
Option 3: Run with Docker (Nginx + PHP 8.3 + MySQL 8.0)

If you want to spin up the containers defined in docker-compose.yml:

Make sure Docker Desktop is open and running.
Copy the environment file and start the containers:
powershell
Copy-Item .env.example .env
docker compose up -d --build
Open http://localhost:8080
in your browser.
To stop the containers later:
powershell
docker compose down
