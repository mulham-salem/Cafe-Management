<?php

namespace App\Http\Controllers;

use App\UserPermission;
use App\Models\Permission;
use App\Models\User;
use App\UserRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;


class UserManagementController extends Controller
{

    public function index(Request $request)
    {
       



    }

 
    public function store(Request $request)
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
    $validated['manager_id']=$manager->id;

    $user = User::create([
        'name' => $validated['name'],
        'email' => $validated['email'],
        'username' => $validated['username'],
        'password' => Hash::make($validated['password']),
        'role' => $validated['role'],
        'manager_id'=>$manager->id
    ]);

    if (isset($validated['permissions'])) {
        foreach ($validated['permissions'] as $permission) {
            Permission::create([
                'user_id' => $user->id,
                'permission' => $permission,
            ]);
        }
    }

    return response()->json([
        'message' => 'User created successfully.',
        'user' => $user->only(['id', 'name', 'email', 'username', 'role']),
        'permissions' => $user->permissions()->pluck('permission')
    ], 201);


    }
//This Is Show Method For User Permissions........................................................................................

   
    public function show(string $id)
    {
        $user = User::with('permissions')->findOrFail($id);

    return response()->json([
        'user' => $user->only(['id', 'name', 'email', 'username', 'role']),
        'permissions' => $user->permissions->pluck('permission')
    ]);
    }
//This Is Update Method For User Data And Permissions&Roles........................................................................................

   
    public function update(Request $request, string $id)
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

    if (!empty($validated['password'])) {
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
//This Is Destoy Method For Deleting User Data And Permissions&Roles........................................................................................

   
    public function destroy(string $id)
    {
         $manager = Auth::guard('manager')->user();

    $user = User::where('manager_id', $manager->id)->findOrFail($id);

    $user->delete();

    return response()->json([
        'message' => 'User deleted successfully.'
    ], 200);
    }
}







    

