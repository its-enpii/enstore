import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'config.dart';
import 'types.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  late Dio _dio;
  String? _authToken;

  factory ApiClient() {
    return _instance;
  }

  ApiClient._internal() {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConfig.baseUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          if (_authToken != null) {
            options.headers['Authorization'] = 'Bearer $_authToken';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) {
          return handler.next(e);
        },
      ),
    );

    _loadToken();
  }

  Future<void> _loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    _authToken = prefs.getString('auth_token');
  }

  Future<void> setToken(String token) async {
    _authToken = token;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  Future<void> clearToken() async {
    _authToken = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }

  Future<ApiResponse<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _dio.get(path, queryParameters: queryParameters);
      return ApiResponse.fromJson(
        response.data,
        fromJson ?? (data) => data as T,
      );
    } on DioException catch (e) {
      if (e.response != null) {
        return ApiResponse.fromJson(
          e.response!.data,
          fromJson ?? (data) => data as T,
        );
      }
      throw e;
    }
  }

  Future<ApiResponse<T>> post<T>(
    String path, {
    dynamic data,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _dio.post(path, data: data);
      return ApiResponse.fromJson(
        response.data,
        fromJson ?? (data) => data as T,
      );
    } on DioException catch (e) {
      if (e.response != null) {
        return ApiResponse.fromJson(e.response!.data, (data) => data as T);
      }
      throw e;
    }
  }

  Future<ApiResponse<T>> put<T>(
    String path, {
    dynamic data,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _dio.put(path, data: data);
      return ApiResponse.fromJson(
        response.data,
        fromJson ?? (data) => data as T,
      );
    } on DioException catch (e) {
      if (e.response != null) {
        return ApiResponse.fromJson(e.response!.data, (data) => data as T);
      }
      throw e;
    }
  }

  Future<ApiResponse<T>> delete<T>(
    String path, {
    dynamic data,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _dio.delete(path, data: data);
      return ApiResponse.fromJson(
        response.data,
        fromJson ?? (data) => data as T,
      );
    } on DioException catch (e) {
      if (e.response != null) {
        return ApiResponse.fromJson(e.response!.data, (data) => data as T);
      }
      throw e;
    }
  }
}
