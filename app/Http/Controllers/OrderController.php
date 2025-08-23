<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Dish;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    // Store a new order (modified to handle delivery fee properly)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'dish_id' => 'required|exists:dishes,id',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string',
            'payment' => 'required|in:COD,GCash',
            'customer_name' => 'nullable|string|max:255',
            'customer_address' => 'nullable|string|max:500',
            'delivery_fee' => 'nullable|numeric|min:0', // Optional delivery fee
            'item_subtotal' => 'nullable|numeric|min:0', // Optional item subtotal
            'order_group_id' => 'nullable|string', // For grouping related orders
        ]);

        $dish = Dish::findOrFail($validated['dish_id']);
        if (!$dish->available) {
            return response()->json(['error' => 'Dish is sold out'], 400);
        }

        // Calculate item total (just the dish cost without delivery fee)
        $itemTotal = $dish->price * $validated['quantity'];
        
        // Add delivery fee only if specified (for the first item in a group)
        $deliveryFee = $validated['delivery_fee'] ?? 0;
        $total = $itemTotal + $deliveryFee;

        $order = Order::create([
            'user_id' => $validated['user_id'],
            'dish_id' => $validated['dish_id'],
            'quantity' => $validated['quantity'],
            'notes' => $validated['notes'] ?? null,
            'payment' => $validated['payment'],
            'customer_name' => $validated['customer_name'] ?? null,
            'customer_address' => $validated['customer_address'] ?? null,
            'total_amount' => $total,
            'order_group_id' => $validated['order_group_id'] ?? null, // Add this field to your orders table
        ]);

        return response()->json([
            'message' => 'Order placed successfully',
            'order' => $order->load('dish')
        ], 201);
    }

    // Store multiple orders at once (enhanced version)
    public function storeBulk(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'customer_name' => 'required|string|max:255',
            'customer_address' => 'required|string|max:500',
            'payment' => 'required|in:COD,GCash',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.dish_id' => 'required|exists:dishes,id',
            'items.*.quantity' => 'required|integer|min:1',
            'delivery_fee' => 'nullable|numeric|min:0', // Total delivery fee for the order
        ]);

        DB::beginTransaction();
        try {
            $orders = [];
            $grandTotal = 0;
            $orderGroupId = uniqid('order_', true); // Generate unique group ID
            $deliveryFee = $validated['delivery_fee'] ?? 20; // Default delivery fee
            
            foreach ($validated['items'] as $index => $item) {
                $dish = Dish::findOrFail($item['dish_id']);
                
                if (!$dish->available) {
                    DB::rollBack();
                    return response()->json([
                        'error' => "Dish '{$dish->name}' is sold out"
                    ], 400);
                }

                // Calculate item total (just dish price × quantity)
                $itemTotal = $dish->price * $item['quantity'];
                $grandTotal += $itemTotal;

                // Add delivery fee only to the first item
                $orderTotal = $itemTotal;
                if ($index === 0) {
                    $orderTotal += $deliveryFee;
                    $grandTotal += $deliveryFee;
                }

                // Create order for this item
                $order = Order::create([
                    'user_id' => $validated['user_id'],
                    'dish_id' => $item['dish_id'],
                    'quantity' => $item['quantity'],
                    'notes' => $validated['notes'] ?? null,
                    'payment' => $validated['payment'],
                    'customer_name' => $validated['customer_name'],
                    'customer_address' => $validated['customer_address'],
                    'total_amount' => $orderTotal,
                    'order_group_id' => $orderGroupId,
                ]);

                $orders[] = $order->load('dish');
            }

            DB::commit();

            return response()->json([
                'message' => 'Orders placed successfully',
                'orders' => $orders,
                'grand_total' => $grandTotal,
                'items_count' => count($orders),
                'order_group_id' => $orderGroupId
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to place orders: ' . $e->getMessage()
            ], 500);
        }
    }

    // Get orders for a user
    public function userOrders($userId)
    {
        return response()->json(
            Order::with('dish')->where('user_id', $userId)->orderBy('created_at', 'desc')->get()
        );
    }

    // Get orders by group ID
    public function getOrderGroup($groupId)
    {
        $orders = Order::with('dish', 'user')
            ->where('order_group_id', $groupId)
            ->orderBy('created_at', 'asc')
            ->get();

        if ($orders->isEmpty()) {
            return response()->json(['error' => 'Order group not found'], 404);
        }

        // Calculate totals
        $subtotal = $orders->sum(function($order) {
            $dish = $order->dish;
            return $dish->price * $order->quantity;
        });
        
        $deliveryFee = $orders->where('total_amount', '>', function($order) {
            return $order->dish->price * $order->quantity;
        })->sum(function($order) {
            return $order->total_amount - ($order->dish->price * $order->quantity);
        });

        return response()->json([
            'orders' => $orders,
            'subtotal' => $subtotal,
            'delivery_fee' => $deliveryFee,
            'grand_total' => $orders->sum('total_amount'),
            'group_id' => $groupId
        ]);
    }

    // Get order details by ID
    public function show($id)
    {
        $order = Order::with('dish', 'user')->findOrFail($id);
        return response()->json($order);
    }

    // Update order status (for admin) - Updated with correct status values
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:Pending,Processing,Completed,Cancelled'
        ]);

        $order = Order::findOrFail($id);
        $order->status = $validated['status'];
        $order->save();

        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => $order->load('dish')
        ]);
    }

    // Get all orders (for admin) - Enhanced to include dish names and group by order_group_id
    public function index()
    {
        $orders = Order::with(['dish:id,name,price', 'user:id,name,email'])
            ->select('id', 'user_id', 'dish_id', 'quantity', 'notes', 'payment', 'customer_name', 
                    'customer_address', 'total_amount', 'status', 'order_group_id', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        // Group orders by order_group_id for better organization
        $groupedOrders = [];
        foreach ($orders as $order) {
            $groupId = $order->order_group_id ?? 'single_' . $order->id;
            
            if (!isset($groupedOrders[$groupId])) {
                $groupedOrders[$groupId] = [];
            }
            
            // Add dish name and other details to make it easier for frontend
            $orderData = $order->toArray();
            $orderData['dish_name'] = $order->dish ? $order->dish->name : 'Unknown Dish';
            $orderData['user_name'] = $order->user ? $order->user->name : $order->customer_name;
            $orderData['user_email'] = $order->user ? $order->user->email : null;
            $orderData['contact_number'] = $order->contact_number ?? 'N/A';
            $orderData['address'] = $order->customer_address ?? 'N/A';
            
            $groupedOrders[$groupId][] = $orderData;
        }

        return response()->json([
            'success' => true,
            'data' => $groupedOrders,
            'message' => 'Orders retrieved successfully'
        ]);
    }

    // Get orders by status
    public function getByStatus($status)
    {
        $validStatuses = ['Pending', 'Processing', 'Completed', 'Cancelled'];
        
        if (!in_array($status, $validStatuses)) {
            return response()->json(['error' => 'Invalid status'], 400);
        }

        $orders = Order::with(['dish:id,name,price', 'user:id,name,email'])
            ->where('status', $status)
            ->orderBy('created_at', 'desc')
            ->get();

        // Add dish names to the response
        $ordersWithDishNames = $orders->map(function($order) {
            $orderData = $order->toArray();
            $orderData['dish_name'] = $order->dish ? $order->dish->name : 'Unknown Dish';
            $orderData['user_name'] = $order->user ? $order->user->name : $order->customer_name;
            return $orderData;
        });

        return response()->json([
            'success' => true,
            'data' => $ordersWithDishNames,
            'message' => 'Orders retrieved successfully'
        ]);
    }
}