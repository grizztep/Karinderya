<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function getDashboardStats()
    {
        try {
            $currentMonth = Carbon::now()->startOfMonth();
            $today = Carbon::today();

            // Get total sales for this month (only completed orders)
            $totalSales = DB::table('orders')
                ->where('created_at', '>=', $currentMonth)
                ->where('status', 'Completed') // Only completed orders
                ->sum('total_amount');

            // Get total orders for today
            $totalOrders = DB::table('orders')
                ->whereDate('created_at', $today)
                ->where('status', '!=', 'cancelled')
                ->count();

            // Get total users registered
            $totalUsers = DB::table('users')
                ->where('role', '!=', 'admin') // Exclude admin users from count
                ->count();

            // Get reservations for today
            $totalReservations = DB::table('reservations')
                ->whereDate('reservation_date', $today)
                ->where('status', '!=', 'cancelled')
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_sales' => number_format($totalSales, 2),
                    'total_orders' => $totalOrders,
                    'total_users' => $totalUsers,
                    'total_reservations' => $totalReservations
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching dashboard stats: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getMonthlySales()
    {
        try {
            $currentMonth = Carbon::now()->startOfMonth();
            
            $monthlySales = DB::table('orders')
                ->where('created_at', '>=', $currentMonth)
                ->where('status', 'Completed') // Only completed orders
                ->selectRaw('DATE(created_at) as date, SUM(total_amount) as daily_total')
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $monthlySales
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching monthly sales: ' . $e->getMessage()
            ], 500);
        }
    }
}