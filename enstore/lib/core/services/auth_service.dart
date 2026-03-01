import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../network/api_client.dart';
import '../constants/api_endpoints.dart';
import '../models/api_response.dart';
import '../models/user.dart';

class AuthService {
  final ApiClient _apiClient;

  AuthService(this._apiClient);

  Future<ApiResponse<User>> login(String identifier, String password) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.login,
        data: {'identifier': identifier, 'password': password},
      );

      final apiResponse = ApiResponse.fromJson(
        response.data,
        (data) => User.fromJson(data['user']),
      );

      if (apiResponse.success && response.data['data'] != null) {
        final token = response.data['data']['access_token'];
        await _saveToken(token);
      }
      return apiResponse;
    } on DioException catch (e) {
      final message = e.response?.data['message'] ?? e.message ?? e.toString();
      return ApiResponse(success: false, message: message);
    } catch (e) {
      return ApiResponse(success: false, message: e.toString());
    }
  }

  Future<ApiResponse<User>> register(Map<String, dynamic> data) async {
    try {
      final response = await _apiClient.post(ApiEndpoints.register, data: data);
      final apiResponse = ApiResponse.fromJson(
        response.data,
        (data) => User.fromJson(data['user']),
      );

      if (apiResponse.success && response.data['data'] != null) {
        final token = response.data['data']['access_token'];
        await _saveToken(token);
      }
      return apiResponse;
    } on DioException catch (e) {
      final message = e.response?.data['message'] ?? e.message ?? e.toString();
      return ApiResponse(success: false, message: message);
    } catch (e) {
      return ApiResponse(success: false, message: e.toString());
    }
  }

  Future<ApiResponse<void>> logout() async {
    try {
      final response = await _apiClient.post(ApiEndpoints.logout);
      await _clearToken();
      return ApiResponse.fromJson(response.data, (_) {});
    } catch (e) {
      await _clearToken();
      return ApiResponse(success: false, message: e.toString());
    }
  }

  Future<ApiResponse<User>> getMe() async {
    try {
      final response = await _apiClient.get(ApiEndpoints.profile);
      return ApiResponse.fromJson(response.data, (data) => User.fromJson(data));
    } catch (e) {
      return ApiResponse(success: false, message: e.toString());
    }
  }

  Future<ApiResponse<User>> updateProfile(Map<String, dynamic> data) async {
    try {
      final response = await _apiClient.put(
        ApiEndpoints.customerUpdateProfile,
        data: data,
      );
      return ApiResponse.fromJson(
        response.data,
        (data) => User.fromJson(data),
      );
    } on DioException catch (e) {
      final message = e.response?.data['message'] ?? e.message ?? e.toString();
      return ApiResponse(success: false, message: message);
    } catch (e) {
      return ApiResponse(success: false, message: e.toString());
    }
  }

  Future<ApiResponse<User>> updateProfileWithAvatar(FormData data) async {
    try {
      // In Laravel, PUT requests don't parse multipart form data directly.
      // So we send as POST, but we handle the '_method' field as 'PUT' in the formData.
      data.fields.add(const MapEntry('_method', 'PUT'));
      
      final response = await _apiClient.post(
        ApiEndpoints.customerUpdateProfile,
        data: data,
      );
      return ApiResponse.fromJson(
        response.data,
        (data) => User.fromJson(data),
      );
    } on DioException catch (e) {
      final message = e.response?.data['message'] ?? e.message ?? e.toString();
      return ApiResponse(success: false, message: message);
    } catch (e) {
      return ApiResponse(success: false, message: e.toString());
    }
  }

  Future<ApiResponse<void>> forgotPassword(String email) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.forgotPassword,
        data: {'email': email},
      );
      return ApiResponse.fromJson(response.data, (_) {});
    } catch (e) {
      return ApiResponse(success: false, message: e.toString());
    }
  }

  Future<ApiResponse<void>> resetPassword(Map<String, dynamic> data) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.resetPassword,
        data: data,
      );
      return ApiResponse.fromJson(response.data, (_) {});
    } catch (e) {
      return ApiResponse(success: false, message: e.toString());
    }
  }

  Future<ApiResponse<void>> changePassword(Map<String, dynamic> data) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.customerChangePassword,
        data: data,
      );
      return ApiResponse.fromJson(response.data, (_) {});
    } on DioException catch (e) {
      final message = e.response?.data['message'] ?? e.message ?? e.toString();
      return ApiResponse(success: false, message: message);
    } catch (e) {
      return ApiResponse(success: false, message: e.toString());
    }
  }

  // --- Token Management ---

  Future<void> _saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  Future<void> _clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }

  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token') != null;
  }
}
