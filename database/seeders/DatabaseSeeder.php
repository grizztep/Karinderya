<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin account
        User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('admin123'),
            'address' => 'Admin Street',
            'contact_number' => '09123456789',
            'role' => 'admin',
        ]);

        // Regular user account
        User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => Hash::make('password123'),
            'address' => '123 Main Street',
            'contact_number' => '09876543210',
            'role' => 'user',
        ]);
    }
}
