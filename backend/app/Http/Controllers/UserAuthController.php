<?php

namespace App\Http\Controllers;

use App\Mail\ResetPasswordMail;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class UserAuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('username', $credentials['username'])->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'message' => ['Invalid username.'],
            ]);
        }

        if (! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'message' => ['Incorrect password.'],
            ]);
        }

        $token = $user->createToken('user_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'role' => $user->role,
            'permissions' => $user->permissions()->pluck('permission'),
            'message' => 'Welcome back '.$user->name,
        ]);
    }

    public function me()
    {
        $user = auth('user')->user();

        return response()->json([
            'role' => $user->role,
            'permissions' => $user->permissions()->pluck('permission'), // بيرجع Array من أسماء الصلاحيات
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 403);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json(['message' => 'Password updated successfully.']);
    }

    public function profile(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'name' => $user->name,
        ]);
    }

    public function sendResetLink(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();
        if (! $user) {
            return response()->json(['message' => 'Email not found.'], 404);
        }

        $token = Str::random(60);

        // حفظ التوكن في جدول password_resets
        DB::table('password_resets')->updateOrInsert(
            ['email' => $user->email],
            ['token' => Hash::make($token), 'created_at' => Carbon::now()]
        );

        // Send to my email the message that has the resetLink that i determined message's structure by writing code in "resetPasswordMail" "App/Mail"
        Mail::to($user->email)->send(new ResetPasswordMail($token, $user->email));

        return response()->json(['message' => 'Reset password link has been sent to your email.']);
    }

    // إعادة تعيين كلمة المرور باستخدام الرابط
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required',
            'password' => 'required|confirmed|min:8',
        ]);

        $record = DB::table('password_resets')->where('email', $request->email)->first();
        if (! $record) {
            return response()->json(['message' => 'Invalid or expired token.'], 400);
        }

        if (! Hash::check($request->token, $record->token)) {
            return response()->json(['message' => 'Invalid token.'], 400);
        }

        $user = User::where('email', $request->email)->first();
        if (! $user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        DB::table('password_resets')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Password has been reset successfully.']);
    }

    // ..................................AccountArragement..................................................
    public function myAccount(Request $request)
    {
        if (auth('manager')->check()) {
            // === حالة المدير ===
            $manager = auth('manager')->user();

            $parts = explode(' ', $manager->name, 2);
            $firstName = $parts[0];
            $lastName = $parts[1] ?? '';

            return response()->json([
                'role' => 'manager',
                'first_name' => $firstName,
                'last_name' => $lastName,
                'username' => $manager->username,
                'email' => $manager->email,
            ]);
        }

        // === حالة المورد / المستخدم العادي ===
        $user = $request->user();

        $baseData = [
            'role' => $user->role,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'username' => $user->username,
            'email' => $user->email,
            'image_url' => $user->image_url,
        ];

        // إذا المورد، نضيف حقول إضافية
        if ($user->role === 'supplier') {
            $baseData['phone_number'] = $user->phone_number;
            $baseData['company_name'] = $user->company_name;
        }

        return response()->json($baseData);
    }

    // PUT /api/user/profile
    public function updateMyAccount(Request $request)
    {
        if (auth('manager')->check()) {
            // === تحديث بيانات المدير ===
            $manager = auth('manager')->user();

            $validated = $request->validate([
                'first_name' => 'string|max:255',
                'last_name' => 'string|max:255|nullable',
                'username' => 'string|max:255|unique:managers,username,'.$manager->id,
                'email' => 'email|unique:managers,email,'.$manager->id,
            ]);

            $manager->name = $validated['first_name'].' '.($validated['last_name'] ?? '');
            $manager->username = $validated['username'];
            $manager->email = $validated['email'];
            $manager->save();

            return response()->json([
                'message' => 'Profile updated successfully',
                'user' => [
                    'role' => 'manager',
                    'first_name' => $validated['first_name'],
                    'last_name' => $validated['last_name'],
                    'username' => $manager->username,
                    'email' => $manager->email,
                ],
            ]);
        }

        // === تحديث بيانات المورد أو المستخدم ===
        $user = $request->user();

        $rules = [
            'first_name' => 'string|max:255',
            'last_name' => 'string|max:255|nullable',
            'username' => 'string|max:255|unique:users,username,'.$user->id,
            'email' => 'email|unique:users,email,'.$user->id,
        ];

        // إذا المورد، نضيف قواعد تحقق إضافية
        if ($user->role === 'supplier') {
            $rules['phone_number'] = 'string|max:20|unique:users,phone_number,'.$user->id;
            $rules['company_name'] = 'string|max:255';
        }

        $validated = $request->validate($rules);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->only([
                'role',
                'first_name',
                'last_name',
                'username',
                'email',
                'image_url',
                'phone_number',
                'company_name',
            ]),
        ]);
    }

    // POST /api/user/upload-avatar
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:3072',
        ], [
            'avatar.max' => 'image must be smaller than 3MB',
        ]);

        $path = $request->file('avatar')->store('avatars', 'public');

        if (auth('manager')->check()) {
            $manager = auth('manager')->user();
            $manager->image_url = asset('storage/'.$path);
            $manager->save();

            return response()->json([
                'message' => 'image uploaded successfully',
                'image_url' => $manager->image_url,
            ]);
        }

        $user = $request->user();
        $user->image_url = asset('storage/'.$path);
        $user->save();

        return response()->json([
            'message' => 'image uploaded successfully',
            'image_url' => $user->image_url,
        ]);
    }
}
