<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param Closure(Request): (Response) $next
     * @param $role
     * @return Response
     */
    public function handle(Request $request, Closure $next, $role): Response
    {
        if(!Auth::check()) {
            return redirect()->route('login.form');
        }

        $user = Auth::user();
        if($user->role !== $role) {
            abort(403, 'Unauthorized action.');
        }

        if(Auth::guard('manager')->check()) {
            abort(403, 'Unauthorized');
        }

        return $next($request);
    }
}
