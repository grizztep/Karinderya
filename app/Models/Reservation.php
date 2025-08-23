<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'user_name',
        'user_email',
        'table_id',
        'guest_count',
        'reservation_date',
        'reservation_time',
        'reserved_at',
        'status',
    ];

    protected $casts = [
        'reservation_date' => 'date',
        'reservation_time' => 'datetime:H:i',
        'reserved_at' => 'datetime',
    ];

    public function table()
    {
        return $this->belongsTo(Table::class);
    }
}