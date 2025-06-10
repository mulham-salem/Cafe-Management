<?php

namespace App\Http\Middleware;

use App\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserRole
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = auth('user')->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if (! in_array($role, UserRole::values())) {
            return response()->json(['message' => 'Invalid role specified'], 400);
        }

        if ($user->role !== $role) {
            return response()->json(['message' => 'Access denied: Insufficient role'], 403);
        }

        return $next($request);
    }
}
