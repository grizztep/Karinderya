<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'order_code',
        'user_id',
        'dish_id',
        'order_group_id',
        'customer_name',
        'customer_address',
        'quantity',
        'notes',
        'payment',
        'total_amount',
        'status',
    ];

    // Automatically generate unique order code
    protected static function booted()
    {
        static::creating(function ($order) {
            if (empty($order->order_code)) {
                // Example format: ORD-20250820-ABC123
                $order->order_code = 'ORD-' . now()->format('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
            }
        });
    }

    // Relationships
    public function dish()
    {
        return $this->belongsTo(Dish::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
