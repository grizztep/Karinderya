<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ReservationController extends Controller
{
    public function index()
    {
        try {
            $reservations = Reservation::with('table')->get();
            return response()->json(['reservations' => $reservations], 200);
        } catch (\Exception $e) {
            Log::error('Failed to fetch reservations: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to fetch reservations'], 500);
        }
    }

    public function checkAvailability(Request $request)
    {
        try {
            $request->validate([
                'reservation_date' => 'required|date',
                'reservation_time' => 'required|date_format:H:i',
            ]);

            $date = $request->reservation_date;
            $time = $request->reservation_time;

            Log::info("Checking availability for date: {$date}, time: {$time}");

            // Get all tables
            $allTables = Table::all();

            // Get reservations for the specific date and time
            $bookedTableIds = Reservation::where('reservation_date', $date)
                ->where('reservation_time', $time)
                ->whereIn('status', ['pending', 'confirmed'])
                ->pluck('table_id')
                ->toArray();

            Log::info("Booked table IDs: " . json_encode($bookedTableIds));

            // Create availability array
            $availability = [];
            foreach ($allTables as $table) {
                $availability[$table->id] = !in_array($table->id, $bookedTableIds);
            }

            Log::info("Availability result: " . json_encode($availability));

            return response()->json([
                'success' => true,
                'availability' => $availability,
                'booked_tables' => $bookedTableIds,
                'total_tables' => $allTables->count()
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid date or time format',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error checking table availability: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Unable to check table availability'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            // Check if user is authenticated
            if (!Auth::check()) {
                return response()->json([
                    'message' => 'Authentication required. Please log in first.'
                ], 401);
            }

            $user = Auth::user();
            Log::info('Reservation request from user: ' . $user->id . ' (' . $user->email . ')');

            // Validate request
            $validated = $request->validate([
                'table_id' => 'required|exists:tables,id',
                'guest_count' => 'required|integer|min:1',
                'reservation_date' => 'required|date|after_or_equal:today',
                'reservation_time' => 'required|date_format:H:i',
            ]);

            // Validate operating hours (6 AM to 3 PM)
            $timeHour = (int) substr($validated['reservation_time'], 0, 2);
            if ($timeHour < 6 || $timeHour > 15) {
                return response()->json([
                    'message' => 'Invalid time. The restaurant is open from 6:00 AM to 3:00 PM only.'
                ], 422);
            }

            // Check if the reservation is for today and time is not in the past
            $reservationDateTime = \Carbon\Carbon::parse($validated['reservation_date'] . ' ' . $validated['reservation_time']);
            if ($reservationDateTime->isToday() && $reservationDateTime->isPast()) {
                return response()->json([
                    'message' => 'Cannot make reservation for past time. Please select a future time.'
                ], 422);
            }

            // Check if the table exists and get max capacity
            $table = Table::find($validated['table_id']);
            if (!$table) {
                return response()->json([
                    'message' => 'Selected table not found.'
                ], 404);
            }

            // Validate guest count doesn't exceed table capacity
            if ($validated['guest_count'] > $table->seats) {
                return response()->json([
                    'message' => "Guest count ({$validated['guest_count']}) exceeds table capacity ({$table->seats} seats)."
                ], 422);
            }

            // Create the reservation
            $reservation = Reservation::create([
                'user_id'          => $user->id, // FIXED: Add the user_id field
                'user_name'        => $user->name,
                'user_email'       => $user->email,
                'table_id'         => $validated['table_id'],
                'guest_count'      => $validated['guest_count'],
                'reservation_date' => $validated['reservation_date'],
                'reservation_time' => $validated['reservation_time'],
                'reserved_at'      => now(),
                'status'           => 'pending', // Always start as pending
            ]);

            // Load the table relationship
            $reservation->load('table');

            Log::info('Reservation created successfully: ' . $reservation->id);

            return response()->json([
                'message' => 'Reservation confirmed! Your reservation is now pending approval.',
                'reservation' => $reservation,
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Validation failed for reservation: ' . json_encode($e->errors()));
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Failed to create reservation: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            Log::error('Request data: ' . json_encode($request->all()));
            Log::error('User data: ' . json_encode($user ?? 'No user'));

            return response()->json([
                'message' => 'Something went wrong while creating your reservation. Please try again.',
                'debug' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}