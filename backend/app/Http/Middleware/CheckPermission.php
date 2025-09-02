<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle($request, Closure $next, $permission)
    {
        $user = auth('sanctum')->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // إذا كان مدير → يدخل مباشرة
        if ($user->role === 'Manager') {
            return $next($request);
        }

        // إذا كان موظف معه الصلاحية → يدخل
        if ($user->permissions()->where('permission', $permission)->exists()) {
            return $next($request);
        }

        return response()->json(['message' => 'Forbidden - no permission'], 403);
    }
}
