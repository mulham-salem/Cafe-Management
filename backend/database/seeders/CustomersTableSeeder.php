<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Seeder;

class CustomersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $freeUsers = User::whereDoesntHave('customer')->whereDoesntHave('employee')->whereDoesntHave('supplier')->get();
        $customerUsers = $freeUsers->take(3);

        foreach ($customerUsers as $user) {
            $user->role = 'customer';
            $user->save();

            Customer::factory()->create(['id' => $user->id]);
        }
    }
}
