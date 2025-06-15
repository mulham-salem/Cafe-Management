<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\User;
use App\UserPermission;
use App\UserRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    public function index(): JsonResponse
    {
        $manager = Auth::guard('manager')->user();

        $users = User::with('permissions')
            ->where('manager_id', $manager->id)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'username' => $user->username,
                    'role' => $user->role,
                    'permissions' => $user->permissions->pluck('permission'),
                ];
            });

        return response()->json($users);
    }

    public function store(Request $request): JsonResponse
    {
        $manager = Auth::guard('manager')->user();
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users,email',
            'username' => 'required|string|unique:users,username',
            'password' => 'required|string|min:8',
            'role' => ['required', Rule::in(UserRole::values())],
            'permissions' => 'array',
            'permissions.*' => [Rule::in(UserPermission::values())],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'manager_id' => $manager->id,
        ]);

        if (isset($validated['permissions'])) {
            foreach ($validated['permissions'] as $permission) {
                Permission::create([
                    'user_id' => $user->id,
                    'permission' => $permission,
                ]);
            }
        }
        switch ($user->role) {
            case UserRole::Customer->value:
                DB::table('customers')->insert([
                    'id' => $user->id,
                    'phone_number' => 'null',
                    'address' => 'null',
                ]);
                break;

            case UserRole::Employee->value:
                DB::table('employees')->insert([
                    'id' => $user->id,
                ]);
                break;

            case UserRole::Supplier->value:
                DB::table('suppliers')->insert([
                    'id' => $user->id,
                    'company_name' => 'null',
                    'phone_number' => 'null',
                ]);
                break;
        }

        return response()->json([
            'message' => 'User created successfully.',
            'user' => $user->only(['id', 'name', 'email', 'username', 'role']),
            'permissions' => $user->permissions()->pluck('permission'),
        ], 201);

    }
    // This Is Show Method For User Permissions........................................................................................

    public function show(string $id): JsonResponse
    {
        $user = User::with('permissions')->findOrFail($id);

        return response()->json([
            'user' => $user->only(['id', 'name', 'email', 'username', 'role']),
        ]);
    }
    // This Is Update Method For User Data And Permissions&Roles........................................................................................

    public function update(Request $request, string $id): JsonResponse
    {
        $manager = Auth::guard('manager')->user();

        $user = User::where('manager_id', $manager->id)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', Rule::unique('users')->ignore($user->id)],
            'username' => ['required', 'string', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'role' => ['required', Rule::in(UserRole::values())],
            'permissions' => 'array',
            'permissions.*' => [Rule::in(UserPermission::values())],
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->username = $validated['username'];
        $user->role = $validated['role'];

        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        if (isset($validated['permissions'])) {
            $permissionValues = collect($validated['permissions'])->map(function ($p) {
                return ['permission' => $p];
            });

            $user->permissions()->delete();
            $user->permissions()->createMany($permissionValues->toArray());
        }

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => $user->only(['id', 'name', 'email', 'username', 'role']),
            'permissions' => $user->permissions()->pluck('permission'),
        ]);

    }
    // This Is Destroy Method For Deleting User Data And Permissions&Roles........................................................................................

    public function destroy(string $id): JsonResponse
    {
        $manager = Auth::guard('manager')->user();

        $user = User::where('manager_id', $manager->id)->findOrFail($id);

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully.',
        ], 200);
    }
}
