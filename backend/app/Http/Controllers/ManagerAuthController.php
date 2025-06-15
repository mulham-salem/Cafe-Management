<?php

namespace App\Http\Controllers;

use App\Models\Manager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ManagerAuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $manager = Manager::where('username', $credentials['username'])->first();

        if (! $manager) {
            throw ValidationException::withMessages([
                'message' => ['Invalid username.'],
            ]);
        }

        if (! Hash::check($credentials['password'], $manager->password)) {
            throw ValidationException::withMessages([
                'message' => ['Incorrect password.'],
            ]);
        }

        $token = $manager->createToken('manager_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'message' => 'Welcome back '.$manager->name,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user('manager')->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $manager = $request->user('manager');

        if (! Hash::check($request->current_password, $manager->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 403);
        }

        $manager->password = Hash::make($request->new_password);
        $manager->save();

        return response()->json(['message' => 'Password updated successfully.']);
    }

    public function profile(Request $request): JsonResponse
    {
        $manager = $request->user('manager');

        return response()->json([
            'name' => $manager->name,
        ]);
    }
}
