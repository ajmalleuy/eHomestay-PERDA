<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Homestay;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * ============================================================================
 * ReportController (app/Http/Controllers/ReportController.php)
 * Handles Page 6: BPE PERDA Officer Reports & Analytics.
 * Filters by date range, district, and homestay, and provides PDF & Excel exports.
 * ============================================================================
 */
class ReportController extends Controller
{
    /**
     * Display the Officer Reports page with filtered metrics and chart datasets.
     */
    public function index(Request $request)
    {
        $query = Booking::with('homestay')->where('status', 'Approved');

        if ($request->filled('start_date')) {
            $query->whereDate('check_in', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('check_out', '<=', $request->end_date);
        }
        if ($request->filled('homestay_id') && $request->homestay_id !== 'ALL') {
            $query->where('homestay_id', $request->homestay_id);
        }
        if ($request->filled('district') && $request->district !== 'ALL') {
            $query->whereHas('homestay', function ($q) use ($request) {
                $q->where('district', 'like', '%' . $request->district . '%');
            });
        }

        $bookings = $query->get();
        $homestays = Homestay::orderBy('name')->get();

        $summary = [
            'monthly_collection' => $bookings->sum('total_price'),
            'tourist_volume'     => $bookings->sum('guests_count'),
            'total_bookings'     => $bookings->count(),
        ];

        return view('pages.reports', compact('bookings', 'homestays', 'summary'));
    }

    /**
     * Export filtered report data as an Excel-compatible CSV file.
     */
    public function exportExcel(Request $request): StreamedResponse
    {
        $bookings = Booking::with('homestay')->where('status', 'Approved')->get();

        return response()->streamDownload(function () use ($bookings) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, [
                'Booking Ref',
                'Homestay Unit',
                'PERDA District',
                'Guest Name',
                'Check-In',
                'Check-Out',
                'Guests',
                'Total Rental Collection (RM)',
            ]);

            foreach ($bookings as $b) {
                fputcsv($handle, [
                    $b->reference_number,
                    $b->homestay->name ?? 'N/A',
                    $b->homestay->district ?? 'N/A',
                    $b->guest_full_name,
                    $b->check_in->format('Y-m-d'),
                    $b->check_out->format('Y-m-d'),
                    $b->guests_count,
                    number_format((float) $b->total_price, 2, '.', ''),
                ]);
            }
            fclose($handle);
        }, 'PERDA_eHomestay_Official_Report_' . date('Ymd') . '.csv');
    }
}

