<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dish extends Model
{
    protected $fillable = ['name', 'price', 'available'];

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
