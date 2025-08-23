<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Reservation;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class TransactionController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        Log::info('Current authenticated user ID: ' . $user->id);
        Log::info('Current authenticated user email: ' . $user->email);
        
        $totalOrders = Order::count();
        $totalReservations = Reservation::count();
        Log::info("Total orders in DB: {$totalOrders}");
        Log::info("Total reservations in DB: {$totalReservations}");
        
        $userOrdersCount = Order::where('user_id', $user->id)->count();
        $userReservationsCount = Reservation::where('user_id', $user->id)->count();
        Log::info("Orders for user {$user->id}: {$userOrdersCount}");
        Log::info("Reservations for user {$user->id}: {$userReservationsCount}");

        $orders = Order::with('dish')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                Log::info("Processing order: " . json_encode($order->toArray()));
                return [
                    'id' => $order->id, // Use actual order ID for individual cancellation
                    'order_group_id' => $order->order_group_id, // Keep group ID for grouping display
                    'date' => $order->created_at->format('Y-m-d H:i'),
                    'items' => ($order->dish->name ?? 'Unknown Dish') . ' (x' . $order->quantity . ')',
                    'total' => number_format($order->total_amount, 2),
                    'status' => $order->status ?? 'Pending',
                ];
            });

        $reservations = Reservation::with('table')
            ->where('user_id', $user->id)
            ->get()
            ->map(function ($res) {
                Log::info("Processing reservation: " . json_encode($res->toArray()));
                $tableName = $res->table->name ?? "Table {$res->table_id}";
                return [
                    'id' => $res->id, // use raw ID here (important for cancel)
                    'date' => $res->reservation_date . ' ' . $res->reservation_time,
                    'items' => "{$tableName} for {$res->guest_count} guests",
                    'total' => '-',
                    'status' => ucfirst($res->status ?? 'Pending'),
                ];
            });

        $response = [
            'orders' => $orders->toArray(),
            'reservations' => $reservations->toArray(),
            'debug' => [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'orders_count' => $orders->count(),
                'reservations_count' => $reservations->count(),
            ]
        ];
        
        Log::info('Final response: ' . json_encode($response));

        return response()->json($response);
    }

    public function cancelOrder($id)
    {
        try {
            $user = Auth::user();
            
            Log::info("Attempting to cancel order with ID: {$id} for user: {$user->id}");

            // Find the specific order by its ID
            $order = Order::where('id', $id)
                ->where('user_id', $user->id)
                ->where('status', 'Pending')
                ->first();

            if (!$order) {
                Log::warning("No cancellable order found with ID: {$id} for user: {$user->id}");
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found or cannot be cancelled.'
                ], 404);
            }

            // Cancel this specific order
            $order->status = 'Cancelled';
            $order->save();
            
            Log::info("Successfully cancelled order ID: {$id}");

            return response()->json([
                'success' => true,
                'message' => 'Order cancelled successfully.',
                'order' => [
                    'id' => $order->id,
                    'order_group_id' => $order->order_group_id,
                    'date' => $order->created_at->format('Y-m-d H:i'),
                    'items' => ($order->dish->name ?? 'Unknown Dish') . ' (x' . $order->quantity . ')',
                    'total' => number_format($order->total_amount, 2),
                    'status' => $order->status,
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error("Error cancelling order: " . $e->getMessage());
            Log::error("Stack trace: " . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while cancelling the order: ' . $e->getMessage()
            ], 500);
        }
    }

    public function cancelReservation($id)
    {
        try {
            $user = Auth::user();
            
            Log::info("Attempting to cancel reservation with ID: {$id} for user: {$user->id}");

            $reservation = Reservation::where('id', $id)
                ->where('user_id', $user->id)
                ->where('status', 'Pending')
                ->first();

            if (!$reservation) {
                Log::warning("No cancellable reservation found with ID: {$id} for user: {$user->id}");
                return response()->json([
                    'success' => false,
                    'message' => 'Reservation not found or cannot be cancelled.'
                ], 404);
            }

            $reservation->status = 'Cancelled';
            $reservation->save();
            
            Log::info("Successfully cancelled reservation ID: {$id}");

            return response()->json([
                'success' => true,
                'message' => 'Reservation cancelled successfully.',
                'reservation' => [
                    'id' => $reservation->id,
                    'date' => $reservation->reservation_date . ' ' . $reservation->reservation_time,
                    'items' => ($reservation->table->name ?? "Table {$reservation->table_id}") . " for {$reservation->guest_count} guests",
                    'total' => '-',
                    'status' => $reservation->status,
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error("Error cancelling reservation: " . $e->getMessage());
            Log::error("Stack trace: " . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while cancelling the reservation: ' . $e->getMessage()
            ], 500);
        }
    }
}