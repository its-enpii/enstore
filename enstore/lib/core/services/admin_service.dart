import '../network/api_client.dart';
import '../constants/api_endpoints.dart';
import '../models/api_response.dart';
import '../models/admin.dart';
import '../models/transaction.dart';

class AdminService {
  final ApiClient _apiClient;

  AdminService(this._apiClient);

  // Dashboard
  Future<ApiResponse<AdminDashboardStats>> getDashboardStats() async {
    final response = await _apiClient.get(ApiEndpoints.adminDashboard);
    return ApiResponse.fromJson(
      response.data,
      (data) => AdminDashboardStats.fromJson(data),
    );
  }

  // Products
  Future<ApiResponse<PaginatedData<AdminProduct>>> getProducts({
    Map<String, dynamic>? filters,
  }) async {
    final response = await _apiClient.get(
      ApiEndpoints.adminProducts,
      queryParameters: filters,
    );
    return ApiResponse.fromJson(
      response.data,
      (data) =>
          PaginatedData.fromJson(data, (item) => AdminProduct.fromJson(item)),
    );
  }

  Future<ApiResponse<AdminProduct>> createProduct(
    Map<String, dynamic> data,
  ) async {
    final response = await _apiClient.post(
      ApiEndpoints.adminProducts,
      data: data,
    );
    return ApiResponse.fromJson(
      response.data,
      (data) => AdminProduct.fromJson(data),
    );
  }

  // Users
  Future<ApiResponse<PaginatedData<AdminUser>>> getUsers({
    Map<String, dynamic>? filters,
  }) async {
    final response = await _apiClient.get(
      ApiEndpoints.adminUsers,
      queryParameters: filters,
    );
    return ApiResponse.fromJson(
      response.data,
      (data) =>
          PaginatedData.fromJson(data, (item) => AdminUser.fromJson(item)),
    );
  }

  // Transactions
  Future<ApiResponse<PaginatedData<Transaction>>> getTransactions({
    Map<String, dynamic>? filters,
  }) async {
    final response = await _apiClient.get(
      ApiEndpoints.adminTransactions,
      queryParameters: filters,
    );
    return ApiResponse.fromJson(
      response.data,
      (data) =>
          PaginatedData.fromJson(data, (item) => Transaction.fromJson(item)),
    );
  }
}
