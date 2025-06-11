<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class IsManager
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::guard('manager')->user();

        $username = $user->username;

        if ($username == 'ManagerAdnan' || $username == 'ManagerMulham') {
            return $next($request);
        }

        return response()->json(['message' => 'Unauthorized. Only managers can perform this action.'], 403);

    }
}
