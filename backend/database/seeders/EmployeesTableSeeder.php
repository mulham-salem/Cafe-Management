<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Seeder;

class EmployeesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $freeUsers = User::whereDoesntHave('customer')->whereDoesntHave('employee')->whereDoesntHave('supplier')->get();
        $employeeUsers = $freeUsers->take(3);

        foreach ($employeeUsers as $user) {
            $user->role = 'employee';
            $user->save();

            Employee::factory()->create(['id' => $user->id]);
        }
    }
}
