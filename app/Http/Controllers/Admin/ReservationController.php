<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ReservationController extends Controller
{
    /**
     * Display a listing of reservations
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Reservation::with('table')
                ->orderBy('reservation_date', 'desc')
                ->orderBy('reservation_time', 'desc');

            // Filter by status if provided
            if ($request->filled('status') && $request->status !== '') {
                $query->where('status', $request->status);
            }

            // Filter by date if provided
            if ($request->filled('date') && $request->date !== '') {
                $query->whereDate('reservation_date', $request->date);
            }

            // Search by customer name or email
            if ($request->filled('search') && $request->search !== '') {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('user_name', 'like', "%{$search}%")
                      ->orWhere('user_email', 'like', "%{$search}%");
                });
            }

            $reservations = $query->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $reservations,
                'message' => 'Reservations retrieved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching reservations: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error fetching reservations: ' . $e->getMessage(),
                'data' => []
            ], 500);
        }
    }

    /**
     * Update reservation status
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled,completed'
        ]);

        try {
            $reservation = Reservation::findOrFail($id);
            
            // Prevent status changes for past reservations (except to completed)
            // Handle different possible formats for reservation_date and reservation_time
            $reservationDate = Carbon::parse($reservation->reservation_date)->format('Y-m-d');
            
            // Check if reservation_time is already a full datetime or just time
            if (strpos($reservation->reservation_time, ':') !== false && strlen($reservation->reservation_time) <= 8) {
                // It's just a time (HH:MM or HH:MM:SS)
                $reservationTime = $reservation->reservation_time;
                $reservationDateTime = Carbon::parse($reservationDate . ' ' . $reservationTime);
            } else {
                // It might be a full datetime, extract just the time part
                $timeOnly = Carbon::parse($reservation->reservation_time)->format('H:i:s');
                $reservationDateTime = Carbon::parse($reservationDate . ' ' . $timeOnly);
            }
            
            if ($reservationDateTime->isPast() && $request->status !== 'completed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot change status for past reservations except to completed'
                ], 400);
            }

            $reservation->update(['status' => $request->status]);

            return response()->json([
                'success' => true,
                'message' => 'Reservation status updated successfully',
                'data' => $reservation->load('table')
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating reservation status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error updating reservation status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get reservation details
     */
    public function show($id)
    {
        try {
            $reservation = Reservation::with(['table' => function($query) {
                $query->select('id', 'name', 'table_number', 'seats');
            }])->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $reservation
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching reservation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Reservation not found'
            ], 404);
        }
    }

    /**
     * Delete a reservation
     */
    public function destroy($id)
    {
        try {
            $reservation = Reservation::findOrFail($id);
            
            // Only allow deletion of pending or cancelled reservations
            if (!in_array($reservation->status, ['pending', 'cancelled'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete confirmed or completed reservations'
                ], 400);
            }

            $reservation->delete();

            return response()->json([
                'success' => true,
                'message' => 'Reservation deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting reservation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error deleting reservation: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get reservation statistics
     */
    public function statistics()
    {
        try {
            $today = Carbon::today();
            $thisMonth = Carbon::now()->startOfMonth();

            $stats = [
                'total_reservations' => Reservation::count(),
                'today_reservations' => Reservation::whereDate('reservation_date', $today)->count(),
                'pending_reservations' => Reservation::where('status', 'pending')->count(),
                'confirmed_reservations' => Reservation::where('status', 'confirmed')->count(),
                'cancelled_reservations' => Reservation::where('status', 'cancelled')->count(),
                'completed_reservations' => Reservation::where('status', 'completed')->count(),
                'this_month_reservations' => Reservation::where('reservation_date', '>=', $thisMonth)->count(),
                'upcoming_reservations' => Reservation::where('reservation_date', '>=', $today)
                                                    ->whereIn('status', ['pending', 'confirmed'])
                                                    ->count()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Statistics retrieved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching statistics: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error fetching statistics: ' . $e->getMessage(),
                'data' => []
            ], 500);
        }
    }

    /**
     * Get available tables for a specific date and time
     */
    public function getAvailableTables(Request $request): JsonResponse
    {
        $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required|date_format:H:i'
        ]);

        $bookedTables = Reservation::where('reservation_date', $request->date)
            ->where('reservation_time', $request->time)
            ->where('status', '!=', 'cancelled')
            ->pluck('table_id');

        $availableTables = Table::whereNotIn('id', $bookedTables)
            ->where('is_available', true)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $availableTables
        ]);
    }
}