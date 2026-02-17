import 'client.dart';
import 'config.dart';
import 'types.dart';

class AdminService {
  static final AdminService _instance = AdminService._internal();

  factory AdminService() {
    return _instance;
  }

  AdminService._internal();

  // Dashboard
  Future<ApiResponse<AdminDashboardStats>> getDashboardStats() async {
    return await ApiClient().get<AdminDashboardStats>(
      ApiConfig.endpoints.admin.dashboard,
      fromJson: (data) => AdminDashboardStats.fromJson(data),
    );
  }

  // Products
  Future<ApiResponse<PaginatedData<AdminProduct>>> getProducts({
    Map<String, dynamic>? filters,
  }) async {
    return await ApiClient().get<PaginatedData<AdminProduct>>(
      ApiConfig.endpoints.admin.products.list,
      queryParameters: filters,
      fromJson: (data) =>
          PaginatedData.fromJson(data, (item) => AdminProduct.fromJson(item)),
    );
  }

  Future<ApiResponse<AdminProduct>> createProduct(
    Map<String, dynamic> data,
  ) async {
    return await ApiClient().post<AdminProduct>(
      ApiConfig.endpoints.admin.products.create,
      data: data,
      fromJson: (data) => AdminProduct.fromJson(data),
    );
  }

  // Users
  Future<ApiResponse<PaginatedData<AdminUser>>> getUsers({
    Map<String, dynamic>? filters,
  }) async {
    return await ApiClient().get<PaginatedData<AdminUser>>(
      ApiConfig.endpoints.admin.users.list,
      queryParameters: filters,
      fromJson: (data) =>
          PaginatedData.fromJson(data, (item) => AdminUser.fromJson(item)),
    );
  }

  // Transactions
  Future<ApiResponse<PaginatedData<Transaction>>> getTransactions({
    Map<String, dynamic>? filters,
  }) async {
    return await ApiClient().get<PaginatedData<Transaction>>(
      ApiConfig.endpoints.admin.transactions.list,
      queryParameters: filters,
      fromJson: (data) =>
          PaginatedData.fromJson(data, (item) => Transaction.fromJson(item)),
    );
  }
}
