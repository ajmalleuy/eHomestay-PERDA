<?php

namespace Database\Seeders;

use App\Models\BlockedDate;
use App\Models\Booking;
use App\Models\Homestay;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * ============================================================================
 * DatabaseSeeder (database/seeders/DatabaseSeeder.php)
 * Seeds realistic Malaysian PERDA homestays, verified BPE PERDA Officer
 * accounts (@perda.gov.my), Homestay Operators, and sample Tourist bookings.
 * ============================================================================
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Verified BPE PERDA Officer (Admin) Account
        $officer = User::create([
            'name'              => 'Encik Mohd Hafiz bin Yusof (BPE Officer)',
            'email'             => 'officer.bpe@perda.gov.my',
            'phone'             => '+604-314 1100',
            'role'              => 'officer',
            'is_verified_admin' => true,
            'email_verified_at' => now(),
            'password'          => Hash::make('PerdaAdmin2026!'),
        ]);

        // 2. Seed Registered Homestay Operator Account
        $operator = User::create([
            'name'              => 'Puan Siti Hajar binti Mansor',
            'email'             => 'operator@homestayperda.my',
            'phone'             => '+60 13-488 9210',
            'role'              => 'operator',
            'is_verified_admin' => false,
            'email_verified_at' => now(),
            'password'          => Hash::make('Operator2026!'),
        ]);

        // 3. Seed Sample Tourist Account
        $tourist = User::create([
            'name'               => 'Nurul Izzah binti Razak',
            'email'              => 'nurul.izzah@gmail.com',
            'phone'              => '+60 12-489 3310',
            'role'               => 'tourist',
            'promo_email_opt_in' => true,
            'is_verified_admin'  => false,
            'email_verified_at'  => now(),
            'password'           => Hash::make('Tourist2026!'),
        ]);

        // 4. Seed Malaysian PERDA Homestay Units
        $h1 = Homestay::create([
            'operator_id'      => $operator->id,
            'name'             => 'Inap Desa Kampung Agung Harmoni',
            'slug'             => 'inap-desa-kampung-agung-harmoni',
            'district'         => 'Seberang Perai Utara (Kepala Batas)',
            'location_address' => 'Kampung Agung, 13200 Kepala Batas, Pulau Pinang',
            'description'      => 'Experience authentic northern Malay village living surrounded by golden paddy fields in Kampung Agung, Kepala Batas.',
            'price_per_night'  => 220.00,
            'max_guests'       => 6,
            'bedrooms'         => 3,
            'bathrooms'        => 2,
            'facilities'       => ['Free Wi-Fi', 'Air Conditioning', 'Halal Kitchen', 'Paddy Field View', 'Free Bicycles'],
            'cover_image'      => 'images/homestay-1.svg',
            'gallery_images'   => ['images/homestay-1.svg', 'images/homestay-2.svg', 'images/homestay-6.svg'],
            'is_active'        => true,
        ]);

        BlockedDate::create([
            'homestay_id'  => $h1->id,
            'blocked_date' => '2026-11-10',
            'reason'       => 'Scheduled Maintenance',
        ]);

        // 5. Seed Sample Booking with 24-Hour Verification Deadline
        Booking::create([
            'reference_number'      => 'PERDA-2026-84920',
            'homestay_id'           => $h1->id,
            'tourist_id'            => $tourist->id,
            'guest_full_name'       => $tourist->name,
            'guest_phone'           => $tourist->phone,
            'guest_email'           => $tourist->email,
            'check_in'              => '2026-11-14',
            'check_out'             => '2026-11-16',
            'nights_count'          => 2,
            'guests_count'          => 4,
            'total_price'           => 440.00,
            'special_requests'      => 'Requesting ground floor bedroom for elderly parents.',
            'payment_proof_path'    => 'images/sample-receipt.svg',
            'payment_proof_mime'    => 'image/png',
            'payment_proof_size'    => 253952,
            'status'                => 'Pending',
            'verification_deadline' => now()->addHours(19),
        ]);
    }
}

