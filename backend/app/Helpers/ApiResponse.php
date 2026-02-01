<?php

namespace App\Helpers;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
  /**
   * Success response
   * 
   * @param mixed $data
   * @param string $message
   * @param int $statusCode
   * @return JsonResponse
   */
  public static function success($data = null, string $message = 'Success', int $statusCode = 200): JsonResponse
  {
    $response = [
      'success' => true,
      'message' => $message,
    ];

    if ($data !== null) {
      $response['data'] = $data;
    }

    return response()->json($response, $statusCode);
  }

  /**
   * Error response
   * 
   * @param string $message
   * @param int $statusCode
   * @param mixed $errors
   * @return JsonResponse
   */
  public static function error(string $message = 'Error', int $statusCode = 400, $errors = null): JsonResponse
  {
    $response = [
      'success' => false,
      'message' => $message,
    ];

    if ($errors !== null) {
      $response['errors'] = $errors;
    }

    return response()->json($response, $statusCode);
  }

  /**
   * Validation error response
   * 
   * @param mixed $errors
   * @param string $message
   * @return JsonResponse
   */
  public static function validationError($errors, string $message = 'Validation failed'): JsonResponse
  {
    return self::error($message, 422, $errors);
  }

  /**
   * Not found response
   * 
   * @param string $message
   * @return JsonResponse
   */
  public static function notFound(string $message = 'Resource not found'): JsonResponse
  {
    return self::error($message, 404);
  }

  /**
   * Unauthorized response
   * 
   * @param string $message
   * @return JsonResponse
   */
  public static function unauthorized(string $message = 'Unauthorized'): JsonResponse
  {
    return self::error($message, 401);
  }

  /**
   * Forbidden response
   * 
   * @param string $message
   * @return JsonResponse
   */
  public static function forbidden(string $message = 'Forbidden'): JsonResponse
  {
    return self::error($message, 403);
  }

  /**
   * Server error response
   * 
   * @param string $message
   * @param \Throwable|null $exception
   * @return JsonResponse
   */
  public static function serverError(string $message = 'Internal server error', ?\Throwable $exception = null): JsonResponse
  {
    $response = [
      'success' => false,
      'message' => $message,
    ];

    // Include exception details in development
    if (config('app.debug') && $exception) {
      $response['debug'] = [
        'exception' => get_class($exception),
        'message' => $exception->getMessage(),
        'file' => $exception->getFile(),
        'line' => $exception->getLine(),
        'trace' => $exception->getTraceAsString(),
      ];
    }

    return response()->json($response, 500);
  }

  /**
   * Created response
   * 
   * @param mixed $data
   * @param string $message
   * @return JsonResponse
   */
  public static function created($data = null, string $message = 'Resource created successfully'): JsonResponse
  {
    return self::success($data, $message, 201);
  }

  /**
   * No content response
   * 
   * @return JsonResponse
   */
  public static function noContent(): JsonResponse
  {
    return response()->json(null, 204);
  }

  /**
   * Paginated response
   * 
   * @param mixed $data
   * @param string $message
   * @return JsonResponse
   */
  public static function paginated($data, string $message = 'Success'): JsonResponse
  {
    return self::success($data, $message);
  }
}
