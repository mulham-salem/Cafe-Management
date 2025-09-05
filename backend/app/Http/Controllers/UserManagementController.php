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
    /**
     * Display a listing of users managed by the authenticated manager/authorized employee.
     */
    public function index(): JsonResponse
    {
        // احصل على الفاعل: إمّا manager عبر غارد manager، أو user عبر الغارد الافتراضي
        if (Auth::guard('manager')->check()) {
            $actor = Auth::guard('manager')->user();
            $isManager = true;
            $managerId = $actor->id;
        } elseif (auth('user')->check()) {
            $actor = auth('user')->user();
            $isManager = false;
            // السماح فقط اذا الـ user هو employee
            if ($actor->role !== UserRole::Employee->value) {
                abort(403, 'Unauthorized');
            }
            // الموظف من المفترض أن له manager_id
            $managerId = $actor->manager_id;
        } else {
            abort(403, 'Unauthorized');
        }

        $users = User::with('permissions')
            ->where('manager_id', $managerId)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'fullName' => $user->full_name,
                    'email' => $user->email,
                    'username' => $user->username,
                    'role' => $user->role,
                    'permissions' => $user->permissions->pluck('permission'),
                ];
            });

        return response()->json($users);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request): JsonResponse
    {
        // تحديد الفاعل/نوعه وmanagerId المرجعي
        if (Auth::guard('manager')->check()) {
            $actor = Auth::guard('manager')->user();
            $isManager = true;
            $managerId = $actor->id;
        } elseif (auth('user')->check()) {
            $actor = auth('user')->user();
            $isManager = false;
            if ($actor->role !== UserRole::Employee->value) {
                abort(403, 'Unauthorized');
            }
            $managerId = $actor->manager_id;
        } else {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'fullName' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users,email',
            'username' => 'required|string|unique:users,username',
            'password' => 'required|string|min:8',
            'role' => ['required', Rule::in(UserRole::values())],
            // permissions مقبول فقط لو الفاعل manager
            'permissions' => $isManager ? 'array' : 'exclude',
            'permissions.*' => $isManager ? [Rule::in(UserPermission::values())] : [],
        ]);

        $fullName = trim($validated['fullName']);
        $nameParts = preg_split('/\s+/', $fullName, 2);

        $firstName = $nameParts[0];
        $lastName = $nameParts[1] ?? null;

        $user = User::create([
            'full_name' => $fullName,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $validated['email'],
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'manager_id' => $managerId, // استخدم managerId من الفاعل (manager نفسه أو manager المرتبط بالموظف)
        ]);

        // فقط ال manager يقدر يضيف صلاحيات
        if ($isManager && isset($validated['permissions'])) {
            foreach ($validated['permissions'] as $permission) {
                Permission::create([
                    'user_id' => $user->id,
                    'permission' => $permission,
                ]);
            }
        } else {
            $defaultPermissions = ['Default'];
            foreach ($defaultPermissions as $permission) {
                Permission::create([
                    'user_id' => $user->id,
                    'permission' => $permission,
                ]);
            }
        }

        // إنشاء الصف الخاص بالدور في الجداول الوريثة
        switch ($user->role) {
            case UserRole::Customer->value:
                DB::table('customers')->insert([
                    'id' => $user->id,
                    'phone_number' => null,
                    'address' => null,
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
                    'company_name' => null,
                    'phone_number' => null,
                ]);
                break;

            case UserRole::DeliveryWorker->value:
                DB::table('delivery_worker')->insert([
                    'id' => $user->id,
                    'transport' => 'Motorbike',
                    'license' => 'SY-12345',
                    'status' => 'Available',
                    'rating' => null,
                ]);
                break;
        }

        return response()->json([
            'message' => 'User created successfully.',
            'user' => $user->only(['id', 'full_name', 'email', 'username', 'role']),
            'permissions' => $user->permissions()->pluck('permission'),
        ], 201);
    }

    /**
     * Update the specified user's data and permissions in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        // تحديد الفاعل
        if (Auth::guard('manager')->check()) {
            $actor = Auth::guard('manager')->user();
            $isManager = true;
            $managerId = $actor->id;
        } elseif (auth('user')->check()) {
            $actor = auth('user')->user();
            $isManager = false;
            if ($actor->role !== UserRole::Employee->value) {
                abort(403, 'Unauthorized');
            }
            $managerId = $actor->manager_id;
        } else {
            abort(403, 'Unauthorized');
        }

        // تأكد أن المستخدم المراد تحديثه يتبع نفس المدير
        $user = User::where('manager_id', $managerId)->findOrFail($id);

        $validated = $request->validate([
            'fullName' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', Rule::unique('users')->ignore($user->id)],
            'username' => ['required', 'string', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'role' => ['required', Rule::in(UserRole::values())],
            // permissions مسموحة فقط للـ manager، وموظف سيحرم من إرسالها
            'permissions' => $isManager ? 'nullable|array' : 'exclude',
            'permissions.*' => $isManager ? [Rule::in(UserPermission::values())] : [],
        ]);

        $fullName = trim($validated['fullName']);
        $nameParts = preg_split('/\s+/', $fullName, 2);

        $firstName = $nameParts[0];
        $lastName = $nameParts[1] ?? null;

        $user->full_name = $fullName;
        $user->first_name = $firstName;
        $user->last_name = $lastName;
        $user->email = $validated['email'];
        $user->username = $validated['username'];
        $user->role = $validated['role'];

        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        // إدارة الصلاحيات: فقط manager يقدر يعدلها
        if ($isManager && isset($validated['permissions'])) {
            $permissionValues = collect($validated['permissions'])->map(function ($p) {
                return ['permission' => $p];
            });

            $user->permissions()->delete();
            $user->permissions()->createMany($permissionValues->toArray());
        }

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => $user->only(['id', 'full_name', 'email', 'username', 'role']),
            'permissions' => $user->permissions()->pluck('permission'),
        ]);
    }


    /**
     * Remove the specified user from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        // تحديد الفاعل
        if (Auth::guard('manager')->check()) {
            $actor = Auth::guard('manager')->user();
            $isManager = true;
            $managerId = $actor->id;
        } elseif (auth('user')->check()) {
            $actor = auth('user')->user();
            $isManager = false;
            if ($actor->role !== UserRole::Employee->value) {
                abort(403, 'Unauthorized');
            }
            $managerId = $actor->manager_id;
        } else {
            abort(403, 'Unauthorized');
        }

        $user = User::where('manager_id', $managerId)->findOrFail($id);

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully.',
        ], 200);
    }

    /**
     * Display the specified user with their permissions.
     */
    public function show(string $id): JsonResponse
    {
        $user = User::with('permissions')->findOrFail($id);

        return response()->json([
            'user' => $user->only(['id', 'full_name', 'email', 'username', 'role']),
        ]);
    }
}
