<?php

namespace App\Http\Controllers;

use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TableController extends Controller
{
    public function index()
    {
        try {
            Log::info('Fetching tables...');
            
            $tables = Table::where('is_available', true)
                          ->orderBy('name')
                          ->get(['id', 'name', 'seats', 'is_available']);
            
            Log::info('Tables fetched successfully: ' . $tables->count() . ' tables');
            
            // Return tables directly (not wrapped in 'tables' key)
            return response()->json($tables, 200);
            
        } catch (\Exception $e) {
            Log::error('Failed to fetch tables: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch tables',
                'debug' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}