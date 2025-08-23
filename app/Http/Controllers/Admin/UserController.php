<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    /**
     * Get all users (excluding admins)
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::where('role', '!=', 'admin');

        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('email', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('contact_number', 'LIKE', "%{$searchTerm}%");
            });
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        $users = $query->select('id', 'name', 'email', 'contact_number', 'address', 'role', 'created_at')
                      ->orderBy('created_at', 'desc')
                      ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $users->items(),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'from' => $users->firstItem(),
                'to' => $users->lastItem()
            ]
        ]);
    }

    /**
     * Delete a user (only non-admin users)
     */
    public function destroy($id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);
            
            // Prevent deletion of admin users
            if ($user->role === 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Admin users cannot be deleted.'
                ], 403);
            }

            $userName = $user->name;
            $user->delete();

            return response()->json([
                'success' => true,
                'message' => "User '{$userName}' has been deleted successfully."
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while deleting the user.'
            ], 500);
        }
    }

    /**
     * Get user statistics
     */
    public function stats(): JsonResponse
    {
        $totalUsers = User::where('role', '!=', 'admin')->count();
        $recentUsers = User::where('role', '!=', 'admin')
                          ->where('created_at', '>=', now()->subDays(7))
                          ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_users' => $totalUsers,
                'recent_users' => $recentUsers
            ]
        ]);
    }
}