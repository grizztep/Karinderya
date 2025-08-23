@extends('layouts.app')

@section('title', 'Reset Password')

@section('content')
<div class="max-w-md mx-auto mt-10 bg-white shadow p-6 rounded-lg">
    <h1 class="text-xl font-bold mb-4">Reset Password</h1>
    
    <form method="POST" action="{{ route('password.update') }}">
        @csrf
        <input type="hidden" name="token" value="{{ $token }}">
        <input type="hidden" name="email" value="{{ $email }}">

        <p class="text-gray-600 mb-4">
            Resetting password for <strong>{{ $email }}</strong>
        </p>

        <div class="mb-4">
            <label for="password" class="block text-sm font-medium text-gray-700">New Password</label>
            <input type="password" id="password" name="password" required
                   class="w-full border rounded p-2 focus:ring-green-500 focus:border-green-500">
        </div>

        <div class="mb-4">
            <label for="password_confirmation" class="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input type="password" id="password_confirmation" name="password_confirmation" required
                   class="w-full border rounded p-2 focus:ring-green-500 focus:border-green-500">
        </div>

        <button type="submit" 
                class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
            Reset Password
        </button>
    </form>
</div>
@endsection
