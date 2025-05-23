<?php

namespace App\Http\Controllers;

use App\Models\Manager;
use App\Models\User;
use Illuminate\Contracts\View\Factory;
use Illuminate\Contracts\View\View;
use Illuminate\Foundation\Application;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Redirector;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;


class AuthController extends Controller
{
    public function showLoginForm(): Factory|View|Application
    {
        return view('auth.login');
    }

    public function login(Request $request): Application|Redirector|RedirectResponse
    {
        $credentials = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $manager = Manager::where('username', $credentials['username'])->first();

        if ($manager) {
            if (Hash::check($credentials['password'], $manager->password)) {
                Auth::guard('manager')->login($manager, $request->has('remember'));
                $request->session()->regenerate();
                return redirect()->intended('/manager')->with('message', 'Welcome manager!');
            }

            return back()->withErrors([
                'password' => 'The password is incorrect!',
            ])->withInput();
        }

        if (Auth::attempt($credentials, $request->has('remember'))) {
            $request->session()->regenerate();
            $user = Auth::user();

            return match ($user->role) {
                'employee' => redirect()->intended('/employee')->with('message', 'Welcome employee!'),
                'supplier' => redirect()->intended('/supplier')->with('message', 'Welcome supplier!'),
                'customer' => redirect()->intended('/customer')->with('message', 'Welcome customer!'),
                default => redirect('login')->with('error', 'Invalid user role!'),
            };
        }

        $userExists = User::where('username', $credentials['username'])->exists();

        return back()->withErrors([
            'username' => $userExists ? '' : 'The username does not exist!',
            'password' => $userExists ? 'The password is incorrect!' : '',
        ])->withInput();
    }

    public function logout(Request $request): Application|Redirector|RedirectResponse
    {
        if(Auth::guard('manager')->check()) {
            Auth::guard('manager')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        if(Auth::guard('web')->check()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }
        return redirect('/login')->with('message', 'Logged out successfully');
    }

    public function showChangePasswordForm(): Factory|View|Application
    {
        return view('auth.change-password');
    }
    public function userChangePassword(Request $request): RedirectResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);
        $user = Auth::user();
        if(!Hash::check($request->current_password, $user->password)) {
            return back()->withErrors(['current_password' => 'The current password is incorrect']);
        }
        $user->update([
           'password' => Hash::make($request->new_password),
        ]);
        return back()->with('message', 'Password changed successfully');
    }

    public function managerChangePassword(Request $request): RedirectResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        $manager = Auth::guard('manager')->user();
        if(!Hash::check($request->current_password, $manager->password)) {
            return back()->withErrors(['current_password' => 'The current password is incorrect']);
        }
        $manager->update([
            'password' => Hash::make($request->new_password),
        ]);

        return back()->with('message', 'Password changed successfully');
    }
}





