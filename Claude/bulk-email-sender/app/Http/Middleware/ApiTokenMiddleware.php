<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiTokenMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();
        $validToken = config('bulkmail.api_token');

        if (empty($validToken) || $token !== $validToken) {
            return response()->json(['error' => '認証に失敗しました'], 401);
        }

        return $next($request);
    }
}
