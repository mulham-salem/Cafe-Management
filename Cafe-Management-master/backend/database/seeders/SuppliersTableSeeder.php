<?php

namespace Database\Seeders;

use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;

class SuppliersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $freeUsers = User::whereDoesntHave('customer')->whereDoesntHave('employee')->whereDoesntHave('supplier')->get();
        $supplierUsers = $freeUsers->take(3);

        foreach ($supplierUsers as $user) {
            $user->role = 'supplier';
            $user->save();

            Supplier::factory()->create(['id' => $user->id]);
        }
    }
}
