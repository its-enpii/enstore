<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Exceptions\InsufficientBalanceException;
use App\Exceptions\ProductUnavailableException;
use App\Exceptions\TransactionFailedException;
use App\Exceptions\PaymentFailedException;
use App\Exceptions\InvalidCredentialsException;
use App\Helpers\ApiResponse;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Illuminate\Support\Facades\Log;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
            'log.api' => \App\Http\Middleware\LogApiRequests::class,
            'log.queries' => \App\Http\Middleware\LogQueries::class,
        ]);

        // Apply API logging to all API routes
        $middleware->group('api', [
            \App\Http\Middleware\LogApiRequests::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Handle custom exceptions
        $exceptions->render(function (InsufficientBalanceException $e) {
            Log::warning('Insufficient balance', ['message' => $e->getMessage()]);
            return ApiResponse::error($e->getMessage(), 400);
        });

        $exceptions->render(function (ProductUnavailableException $e) {
            Log::warning('Product unavailable', ['message' => $e->getMessage()]);
            return ApiResponse::error($e->getMessage(), 400);
        });

        $exceptions->render(function (TransactionFailedException $e) {
            Log::error('Transaction failed', ['message' => $e->getMessage()]);
            return ApiResponse::error($e->getMessage(), 400);
        });

        $exceptions->render(function (PaymentFailedException $e) {
            Log::error('Payment failed', ['message' => $e->getMessage()]);
            return ApiResponse::error($e->getMessage(), 400);
        });

        $exceptions->render(function (InvalidCredentialsException $e) {
            Log::warning('Invalid credentials attempt');
            return ApiResponse::unauthorized($e->getMessage());
        });

        // Handle authentication exceptions
        $exceptions->render(function (AuthenticationException $e) {
            return ApiResponse::unauthorized('Unauthenticated');
        });

        // Handle validation exceptions
        $exceptions->render(function (ValidationException $e) {
            return ApiResponse::validationError($e->errors(), $e->getMessage());
        });

        // Handle model not found
        $exceptions->render(function (ModelNotFoundException $e) {
            Log::info('Model not found', ['model' => $e->getModel()]);
            return ApiResponse::notFound('Resource not found');
        });

        // Handle 404 not found
        $exceptions->render(function (NotFoundHttpException $e) {
            return ApiResponse::notFound('Endpoint not found');
        });

        // Handle 403 forbidden
        $exceptions->render(function (AccessDeniedHttpException $e) {
            return ApiResponse::forbidden($e->getMessage() ?: 'Access denied');
        });

        // Handle general exceptions
        $exceptions->render(function (\Throwable $e) {
            Log::error('Unhandled exception', [
                'exception' => get_class($e),
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return ApiResponse::serverError(
                config('app.debug') ? $e->getMessage() : 'Internal server error',
                $e
            );
        });
    })->create();
