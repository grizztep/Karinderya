<?php

namespace App\Http\Controllers;

use App\Models\Dish;
use Illuminate\Http\Request;

class DishController extends Controller
{
    // List all dishes
    public function index()
    {
        return response()->json(Dish::all());
    }

    // Add a new dish
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'price' => 'required|numeric',
            'available' => 'boolean'
        ]);

        $dish = Dish::create($validated);

        return response()->json($dish, 201);
    }

    // Update dish availability or details
    public function update(Request $request, Dish $dish)
    {
        $dish->update($request->all());
        return response()->json($dish);
    }

    // Delete a dish
    public function destroy(Dish $dish)
    {
        $dish->delete();
        return response()->json(['message' => 'Dish deleted']);
    }
}
