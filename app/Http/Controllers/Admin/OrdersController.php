<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class OrdersController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = DB::table('orders')
                ->leftJoin('users', 'orders.user_id', '=', 'users.id')
                ->leftJoin('dishes', 'orders.dish_id', '=', 'dishes.id') // 👈 ADD THIS JOIN
                ->select([
                    DB::raw("DATE(orders.created_at) as date"),
                    'orders.id',
                    'orders.order_group_id',
                    'orders.dish_id',
                    'orders.quantity', // 👈 ADD QUANTITY
                    'orders.total_amount',
                    'orders.status',
                    'orders.created_at',
                    'orders.updated_at',
                    'orders.customer_name',
                    'dishes.name as dish_name', // 👈 ADD DISH NAME
                    'dishes.price as dish_price', // 👈 ADD DISH PRICE
                    'users.name as user_name',
                    'users.email as user_email',
                    'users.contact_number',
                    'users.address'
                ]);

            // 👉 Text filter - include dish name in search
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('orders.customer_name', 'like', "%$search%")
                    ->orWhere('users.name', 'like', "%$search%")
                    ->orWhere('users.email', 'like', "%$search%")
                    ->orWhere('dishes.name', 'like', "%$search%"); // 👈 ADD DISH NAME SEARCH
                });
            }

            // 👉 Date filter (from–to)
            if ($request->has('from_date') && $request->has('to_date')) {
                $query->whereBetween(DB::raw("DATE(orders.created_at)"), [
                    $request->from_date,
                    $request->to_date
                ]);
            } elseif ($request->has('from_date')) {
                $query->whereDate('orders.created_at', '>=', $request->from_date);
            } elseif ($request->has('to_date')) {
                $query->whereDate('orders.created_at', '<=', $request->to_date);
            }

            $orders = $query->orderBy('orders.created_at', 'desc')
                ->get()
                ->groupBy('order_group_id');

            return response()->json([
                'success' => true,
                'data' => $orders
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching orders: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => ['required', 'string', Rule::in(['Pending', 'Processing', 'Completed', 'Cancelled'])]
        ]);

        $updated = DB::table('orders')
            ->where('id', $id)
            ->update([
                'status' => $request->status,
                'updated_at' => now()
            ]);

        return response()->json([
            'success' => true,
            'message' => $updated ? 'Order updated' : 'Order not found'
        ]);
    }

    public function show($id)
    {
        try {
            $order = DB::table('orders')
                ->leftJoin('users', 'orders.user_id', '=', 'users.id')
                ->leftJoin('dishes', 'orders.dish_id', '=', 'dishes.id') // 👈 ADD DISH JOIN
                ->select([
                    'orders.*',
                    'dishes.name as dish_name', // 👈 ADD DISH NAME
                    'dishes.price as dish_price', // 👈 ADD DISH PRICE
                    'users.name as user_name',
                    'users.email as user_email',
                    'users.contact_number',
                    'users.address'
                ])
                ->where('orders.id', $id)
                ->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $order
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching order: ' . $e->getMessage()
            ], 500);
        }
    }
}