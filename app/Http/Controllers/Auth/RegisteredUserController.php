<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules;

class RegisteredUserController extends Controller
{
    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
                'password' => ['required', 'string', 'min:8'],
                'confirmPassword' => ['required', 'string', 'same:password'],
                'address' => ['required', 'string', 'max:500'],
                'contactNumber' => ['required', 'string', 'regex:/^(\+63|0)?[9]\d{9}$/'],
            ]);

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'address' => $request->address,
                'contact_number' => $request->contactNumber, // Changed to match database column
                'role' => 'user', // Set default role
            ]);

            // Optional: Auto-login the user after registration
            Auth::login($user);

            return response()->json([
                'message' => 'User registered successfully',
                'user' => $user->only(['id', 'name', 'email', 'address', 'contact_number', 'role'])
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Registration failed: ' . $e->getMessage()
            ], 500);
        }
    }
}