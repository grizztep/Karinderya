<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\PasswordResetController;
use Illuminate\Support\Facades\Password;
use Illuminate\Http\Request;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\TableController;
use App\Http\Controllers\DishController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\OrdersController;
use App\Http\Controllers\Admin\ReservationController as AdminReservationController;
use App\Http\Controllers\Admin\UserController; // Add this import

Route::get('/', function () {
    return view('welcome');
});

// Authentication
Route::post('/signup', [RegisteredUserController::class, 'store']);
Route::post('/login', [LoginController::class, 'login']);
Route::post('/logout', [LoginController::class, 'logout']);
Route::get('/check-auth', [LoginController::class, 'checkAuth']);

// Tables route (public)
Route::get('/tables', [TableController::class, 'index']);

// Availability check (public - doesn't need auth to check availability)
Route::post('/check-availability', [ReservationController::class, 'checkAvailability']);

// Dishes routes
Route::get('/dishes', [DishController::class, 'index']);
Route::post('/dishes', [DishController::class, 'store']);
Route::put('/dishes/{dish}', [DishController::class, 'update']);
Route::delete('/dishes/{dish}', [DishController::class, 'destroy']);

// Enhanced order routes
Route::middleware('auth')->group(function () {
    // Existing order routes
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/user/{id}', [OrderController::class, 'userOrders']);
    
    // New enhanced order routes
    Route::post('/orders/bulk', [OrderController::class, 'storeBulk']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/status/{status}', [OrderController::class, 'getByStatus']);
});

// Forgot Password (send reset link)
Route::post('/forgot-password', function (Request $request) {
    $request->validate(['email' => 'required|email']);

    $status = Password::sendResetLink(
        $request->only('email')
    );

    return $status === Password::RESET_LINK_SENT
        ? response()->json(['message' => __($status)], 200)
        : response()->json(['message' => __($status)], 400);
})->name('password.email');

// Route to show the reset form
Route::get('/reset-password/{token}', [PasswordResetController::class, 'showResetForm'])
    ->name('password.reset');

// Route to handle the form submission
Route::post('/password/reset', [PasswordResetController::class, 'reset'])
    ->name('password.update');

// ADMIN ROUTES - All admin functionality grouped together
Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    
    // Dashboard API routes
    Route::get('/dashboard/stats', [DashboardController::class, 'getDashboardStats'])->name('admin.dashboard.stats');
    Route::get('/dashboard/monthly-sales', [DashboardController::class, 'getMonthlySales'])->name('admin.dashboard.monthly-sales');
    
    // Orders Management routes
    Route::get('/orders', [OrdersController::class, 'index'])->name('admin.orders.index');
    Route::get('/orders/{id}', [OrdersController::class, 'show'])->name('admin.orders.show');
    Route::put('/orders/{id}/status', [OrdersController::class, 'updateStatus']);
    
    // USER MANAGEMENT ROUTES - NEW ADDITION
    Route::get('/users', [UserController::class, 'index'])->name('admin.users.index');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('admin.users.destroy');
    Route::get('/users/stats', [UserController::class, 'stats'])->name('admin.users.stats');
    
    // Reservations Management routes
    Route::get('reservations', [AdminReservationController::class, 'index'])
        ->name('admin.reservations.index');
    Route::get('reservations/{id}', [AdminReservationController::class, 'show'])
        ->name('admin.reservations.show');
    Route::put('reservations/{id}/status', [AdminReservationController::class, 'updateStatus'])
        ->name('admin.reservations.updateStatus');
    Route::delete('reservations/{id}', [AdminReservationController::class, 'destroy'])
        ->name('admin.reservations.destroy');
    Route::get('reservations-statistics', [AdminReservationController::class, 'statistics'])
        ->name('admin.reservations.statistics');
    Route::get('available-tables', [AdminReservationController::class, 'getAvailableTables'])
        ->name('admin.reservations.availableTables');
});

// Protected Routes
Route::middleware(['auth'])->group(function () {
    // Dashboard routes
    Route::get('/admin-dashboard', function () {
        return view('admin-dashboard');
    });

    Route::get('/user-dashboard', function () {
        return view('user-dashboard');
    });

    // Profile route
    Route::post('/update-profile', [ProfileController::class, 'update']);
    
    // Protected reservation routes
    Route::post('/reserve-seat', [ReservationController::class, 'store']);
    Route::get('/reservations', [ReservationController::class, 'index']);
    
    // TRANSACTIONS ROUTES - Allow string IDs
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::post('/transactions/orders/{id}/cancel', [TransactionController::class, 'cancelOrder'])
        ->where('id', '[A-Za-z0-9]+');
    Route::post('/transactions/reservations/{id}/cancel', [TransactionController::class, 'cancelReservation']);
});