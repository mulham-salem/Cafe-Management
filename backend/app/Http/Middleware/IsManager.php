<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class IsManager
{
    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param Closure(Request): (Response) $next
     * @return JsonResponse|mixed|Response
     */
    public function handle(Request $request, Closure $next): mixed
    {
        $user = Auth::guard('manager')->user();

        $username = $user->username;

        if ($username == 'ManagerAdnan' || $username == 'ManagerMulham') {
            return $next($request);
        }

        return response()->json(['message' => 'Unauthorized. Only managers can perform this action.'], 403);

    }
}
