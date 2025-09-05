<?php

namespace App\Http\Controllers;

use App\Mail\ResetPasswordMail;
use App\Models\Manager;
use App\Models\User;
use Carbon\Carbon;
use http\Env\Response;
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
            'message' => 'Welcome back '.$user->first_name,
        ]);
    }

    public function me()
    {
        $manager = auth('manager')->user();
        if($manager) {
            return response()->json([
               'role' => strtolower($manager->role),
            ]);
        }

        $user = auth('user')->user();
        if($user) {
            return response()->json([
                'role' => $user->role,
                'permissions' => $user->permissions()->pluck('permission'), // بيرجع Array من أسماء الصلاحيات
            ]);
        }
        return response()->json(['message' => 'Unauthenticated'], 401);
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
            'firstName' => $user->first_name,
        ]);
    }

    public function sendResetLink(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first() ?? Manager::where('email', $request->email)->first();
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

        $user = User::where('email', $request->email)->first() ?? Manager::where('email', $request->email)->first();
        if (! $user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        DB::table('password_resets')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Password has been reset successfully.']);
    }

    // GET /api/user/profile
    public function myAccount(Request $request)
    {
        if (auth('manager')->check()) {
            // المدير عامل تسجيل دخول
            $manager = auth('manager')->user();

            // افتراضياً نفصل الاسم عند أول فراغ
            $parts = explode(' ', $manager->name, 2);
            $firstName = $parts[0];
            $lastName = $parts[1] ?? ''; // إذا ما فيه جزء ثاني، نتركه فارغ

            return response()->json([
                'first_name' => $firstName,
                'last_name' => $lastName,
                'username' => $manager->username,
                'email' => $manager->email,
            ]);
        }

        // إذا كان user عادي
        $user = $request->user();

        return response()->json([
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'username' => $user->username,
            'email' => $user->email,
            'image_url' => $user->image_url,
        ]);
    }


    // PUT /api/user/profile
    public function updateMyAccount(Request $request)
    {
        // تحقق إذا المدير عامل تسجيل دخول
        if (auth('manager')->check()) {
            $manager = auth('manager')->user();

            $validated = $request->validate([
                'first_name' => 'string|max:255',
                'last_name' => 'string|max:255|nullable',
                'username' => 'string|max:255|unique:managers,username,'.$manager->id,
                'email' => 'email|unique:managers,email,'.$manager->id,
            ]);

            // دمج الاسم الأول والأخير
            $manager->name = $validated['first_name'] . ' ' . $validated['last_name'];
            $manager->username = $validated['username'];
            $manager->email = $validated['email'];

            $manager->save();

            return response()->json([
                'message' => 'Profile updated successfully',
                'user' => [
                    'first_name' => $validated['first_name'],
                    'last_name' => $validated['last_name'],
                    'username' => $manager->username,
                    'email' => $manager->email,
                ],
            ]);
        }

        // إذا كان user
        $user = $request->user();

        $validated = $request->validate([
            'first_name' => 'string|max:255',
            'last_name' => 'string|max:255|nullable',
            'username' => 'string|max:255|unique:users,username,'.$user->id,
            'email' => 'email|unique:users,email,'.$user->id,
        ]);

        // بناءً على الدور، يمكن هنا عمل أي تخصيص إضافي إذا لزم
        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->only(['first_name', 'last_name', 'username', 'email', 'image_url']),
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

        $user = $request->user();
        $user->image_url = asset('storage/'.$path);
        $user->save();

        return response()->json([
            'message' => 'image uploaded successfully',
            'image_url' => $user->image_url,
        ]);
    }
}
