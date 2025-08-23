<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Table;

class TableSeeder extends Seeder
{
    public function run()
    {
        $tables = [
            ['name' => 'Table 1', 'seats' => 2, 'is_available' => true],
            ['name' => 'Table 2', 'seats' => 4, 'is_available' => true],
            ['name' => 'Table 3', 'seats' => 6, 'is_available' => true],
            ['name' => 'Table 4', 'seats' => 2, 'is_available' => true],
            ['name' => 'Table 5', 'seats' => 4, 'is_available' => true],
        ];

        foreach ($tables as $table) {
            Table::create($table);
        }
    }
}