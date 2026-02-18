import 'client.dart';
import 'config.dart';
import 'types.dart';

class CustomerService {
  static final CustomerService _instance = CustomerService._internal();

  factory CustomerService() {
    return _instance;
  }

  CustomerService._internal();

  Future<ApiResponse<CustomerProfile>> getProfile() async {
    return await ApiClient().get<CustomerProfile>(
      ApiConfig.endpoints.customer.profile,
      fromJson: (data) => CustomerProfile.fromJson(data),
    );
  }

  Future<ApiResponse<CustomerProfile>> updateProfile(
    Map<String, dynamic> data,
  ) async {
    return await ApiClient().put<CustomerProfile>(
      ApiConfig.endpoints.customer.updateProfile,
      data: data,
      fromJson: (data) => CustomerProfile.fromJson(data),
    );
  }

  Future<ApiResponse<void>> changePassword(
    String currentPassword,
    String newPassword,
    String confirmPassword,
  ) async {
    return await ApiClient().post<void>(
      ApiConfig.endpoints.customer.changePassword,
      data: {
        'current_password': currentPassword,
        'new_password': newPassword,
        'new_password_confirmation': confirmPassword,
      },
    );
  }

  Future<ApiResponse<BalanceData>> getBalance() async {
    return await ApiClient().get<BalanceData>(
      ApiConfig.endpoints.customer.balance,
      fromJson: (data) => BalanceData.fromJson(data),
    );
  }

  Future<ApiResponse<List<BalanceMutation>>> getBalanceMutations({
    int limit = 50,
  }) async {
    return await ApiClient().get<List<BalanceMutation>>(
      ApiConfig.endpoints.customer.balanceMutations,
      queryParameters: {'limit': limit},
      fromJson: (data) =>
          (data as List).map((e) => BalanceMutation.fromJson(e)).toList(),
      // Fix: Types in ApiClient.get might need adjustment for List<T> or wrapper
    );
  }

  Future<ApiResponse<PaginatedData<CustomerTransaction>>> getTransactions({
    Map<String, dynamic>? filters,
  }) async {
    return await ApiClient().get<PaginatedData<CustomerTransaction>>(
      ApiConfig.endpoints.customer.transactions,
      queryParameters: filters,
      fromJson: (data) => PaginatedData.fromJson(
        data,
        (item) => CustomerTransaction.fromJson(item),
      ),
    );
  }

  Future<ApiResponse<CustomerTransaction>> getTransactionDetail(
    String code,
  ) async {
    return await ApiClient().get<CustomerTransaction>(
      ApiConfig.endpoints.customer.transactionDetail(code),
      fromJson: (data) => CustomerTransaction.fromJson(data),
    );
  }

  // Notifications
  Future<ApiResponse<PaginatedData<AppNotification>>> getNotifications({
    int page = 1,
  }) async {
    return await ApiClient().get<PaginatedData<AppNotification>>(
      ApiConfig.endpoints.customer.notifications.list,
      queryParameters: {'page': page},
      fromJson: (data) => PaginatedData.fromJson(
        data,
        (item) => AppNotification.fromJson(item),
      ),
    );
  }

  Future<ApiResponse<int>> getUnreadNotificationCount() async {
    return await ApiClient().get<int>(
      ApiConfig.endpoints.customer.notifications.count,
      fromJson: (data) =>
          data['count'] ?? 0, // Assuming { count: 5 } response format
    );
  }

  Future<ApiResponse<void>> markNotificationAsRead(String id) async {
    return await ApiClient().post<void>(
      ApiConfig.endpoints.customer.notifications.markAsRead(id),
    );
  }

  Future<ApiResponse<void>> markAllNotificationsAsRead() async {
    return await ApiClient().post<void>(
      ApiConfig.endpoints.customer.notifications.markAllAsRead,
    );
  }
}
