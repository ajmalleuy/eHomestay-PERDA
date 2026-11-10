<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\VerificationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| e-Homestay PERDA (Inap Desa) - Web Routes (routes/web.php)
|--------------------------------------------------------------------------
| Defines all 6 core platform pages and their form submission endpoints.
*/

// Page 1: Landing & Search + Tourist Registration (with promotional opt-in)
Route::get('/', [HomeController::class, 'index'])->name('landing');
Route::post('/register-tourist', [HomeController::class, 'registerTourist'])->name('tourist.register');

// Page 2: Tourist Booking Form, 5MB Payment Proof Upload & Reference Tracker
Route::get('/booking', [BookingController::class, 'create'])->name('booking.create');
Route::post('/booking', [BookingController::class, 'store'])->name('booking.store');

// Page 3: Internal Login for Homestay Operators & Verified BPE PERDA Officers
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'authenticate'])->name('login.authenticate');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Page 4: Officer & Operator Dashboard + Homestay CRUD + Block Calendar Tool
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
Route::post('/dashboard/homestay', [DashboardController::class, 'saveHomestay'])->name('dashboard.homestay.save');
Route::post('/dashboard/block-date', [DashboardController::class, 'toggleBlockedDate'])->name('dashboard.block-date');

// Page 5: Operator Payment Verification & 24-Hour SLA Approval
Route::get('/verification', [VerificationController::class, 'index'])->name('verification.index');
Route::patch('/verification/{booking}/status', [VerificationController::class, 'updateStatus'])->name('verification.status');

// Page 6: BPE PERDA Officer Reports & PDF / Excel Export
Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
Route::get('/reports/export-excel', [ReportController::class, 'exportExcel'])->name('reports.export.excel');

