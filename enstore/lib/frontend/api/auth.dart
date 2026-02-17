import 'client.dart';
import 'config.dart';
import 'types.dart';

class AuthService {
  static final AuthService _instance = AuthService._internal();

  factory AuthService() {
    return _instance;
  }

  AuthService._internal();

  Future<ApiResponse<LoginResponse>> login(
    String email,
    String password,
  ) async {
    final response = await ApiClient().post<LoginResponse>(
      ApiConfig.endpoints.auth.login,
      data: {'email': email, 'password': password},
      fromJson: (data) => LoginResponse.fromJson(data),
    );

    if (response.success && response.data != null) {
      await ApiClient().setToken(response.data!.token);
    }

    return response;
  }

  Future<ApiResponse<User>> register(Map<String, dynamic> data) async {
    final response = await ApiClient().post<User>(
      ApiConfig.endpoints.auth.register,
      data: data,
      fromJson: (data) => User.fromJson(data),
    );
    // Register might return token too, depending on backend. Assuming auto-login or just user data.
    return response;
  }

  Future<ApiResponse<void>> logout() async {
    final response = await ApiClient().post<void>(
      ApiConfig.endpoints.auth.logout,
    );
    if (response.success) {
      await ApiClient().clearToken();
    }
    return response;
  }

  Future<ApiResponse<User>> getMe() async {
    return await ApiClient().get<User>(
      ApiConfig.endpoints.auth.profile,
      fromJson: (data) => User.fromJson(data),
    );
  }

  Future<ApiResponse<void>> forgotPassword(String email) async {
    return await ApiClient().post<void>(
      ApiConfig.endpoints.auth.forgotPassword,
      data: {'email': email},
    );
  }

  Future<ApiResponse<void>> resetPassword(Map<String, dynamic> data) async {
    return await ApiClient().post<void>(
      ApiConfig.endpoints.auth.resetPassword,
      data: data,
    );
  }
}
