<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\User;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $employees = User::where('role', 'employee')->get();
        $suppliers = User::where('role', 'supplier')->get();

        $employeePermissions = collect([
            'User Management',
            'Menu Management',
            'Table Management',
            'Inventory & Supply',
            'Promotion Management',
            "Manager's Notifications",
        ]);

        foreach ($employees as $employee) {
            if ($employee->permissions()->count() === 0) {
                if (rand(0, 1)) {
                    $randomPermissions = $employeePermissions->shuffle()->take(rand(1, 5));
                    foreach ($randomPermissions as $perm) {
                        Permission::factory()->create([
                            'user_id' => $employee->id,
                            'permission' => $perm,
                        ]);
                    }
                } else {
                    Permission::factory()->create([
                        'user_id' => $employee->id,
                        'permission' => 'Default',
                    ]);
                }
            }
        }

        foreach ($suppliers as $supplier) {
            if ($supplier->permissions()->count() === 0) {
                $permission = collect(['Default', 'Inventory & Supply'])->random();
                Permission::factory()->create([
                    'user_id' => $supplier->id,
                    'permission' => $permission,
                ]);
            }
        }
    }
}
