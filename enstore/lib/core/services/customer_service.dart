import '../network/api_client.dart';
import '../constants/api_endpoints.dart';
import '../models/api_response.dart';
import '../models/user.dart';
import '../models/balance.dart';
import '../models/transaction.dart';
import '../models/notification.dart';
import '../models/postpaid.dart';

class CustomerService {
  final ApiClient _apiClient;

  CustomerService(this._apiClient);

  Future<ApiResponse<User>> getProfile() async {
    final response = await _apiClient.get(ApiEndpoints.customerProfile);
    return ApiResponse.fromJson(response.data, (data) => User.fromJson(data));
  }

  Future<ApiResponse<User>> updateProfile(Map<String, dynamic> data) async {
    final response = await _apiClient.put(
      ApiEndpoints.customerUpdateProfile,
      data: data,
    );
    return ApiResponse.fromJson(response.data, (data) => User.fromJson(data));
  }

  Future<ApiResponse<void>> changePassword(
    String currentPassword,
    String newPassword,
    String confirmPassword,
  ) async {
    final response = await _apiClient.post(
      ApiEndpoints.customerChangePassword,
      data: {
        'current_password': currentPassword,
        'new_password': newPassword,
        'new_password_confirmation': confirmPassword,
      },
    );
    return ApiResponse.fromJson(response.data, (_) {});
  }

  Future<ApiResponse<BalanceData>> getBalance() async {
    final response = await _apiClient.get(ApiEndpoints.customerBalance);
    return ApiResponse.fromJson(
      response.data,
      (data) => BalanceData.fromJson(data),
    );
  }

  Future<ApiResponse<List<BalanceMutation>>> getBalanceMutations({
    int limit = 50,
  }) async {
    final response = await _apiClient.get(
      ApiEndpoints.customerBalanceMutations,
      queryParameters: {'limit': limit},
    );
    return ApiResponse.fromJson(
      response.data,
      (data) => (data as List).map((e) => BalanceMutation.fromJson(e)).toList(),
    );
  }

  Future<ApiResponse<PaginatedData<Transaction>>> getTransactions({
    Map<String, dynamic>? filters,
  }) async {
    final response = await _apiClient.get(
      ApiEndpoints.customerTransactions,
      queryParameters: filters,
    );
    return ApiResponse.fromJson(
      response.data,
      (data) =>
          PaginatedData.fromJson(data, (item) => Transaction.fromJson(item)),
    );
  }

  Future<ApiResponse<Transaction>> getTransactionDetail(String code) async {
    final response = await _apiClient.get(
      ApiEndpoints.customerTransactionDetail(code),
    );
    return ApiResponse.fromJson(
      response.data,
      (data) => Transaction.fromJson(data),
    );
  }

  // Notifications
  Future<ApiResponse<PaginatedData<AppNotification>>> getNotifications({
    int page = 1,
  }) async {
    final response = await _apiClient.get(
      ApiEndpoints.customerNotifications,
      queryParameters: {'page': page},
    );
    return ApiResponse.fromJson(
      response.data,
      (data) => PaginatedData.fromJson(
        data,
        (item) => AppNotification.fromJson(item),
      ),
    );
  }

  Future<ApiResponse<int>> getUnreadNotificationCount() async {
    final response = await _apiClient.get(
      ApiEndpoints.customerNotificationCount,
    );
    return ApiResponse.fromJson(response.data, (data) => data['count'] ?? 0);
  }

  Future<ApiResponse<void>> markNotificationAsRead(String id) async {
    final response = await _apiClient.post(
      ApiEndpoints.customerNotificationRead(id),
    );
    return ApiResponse.fromJson(response.data, (_) {});
  }

  Future<ApiResponse<void>> markAllNotificationsAsRead() async {
    final response = await _apiClient.post(
      ApiEndpoints.customerNotificationReadAll,
    );
    return ApiResponse.fromJson(response.data, (_) {});
  }

  // Postpaid (PPOB)
  Future<ApiResponse<PostpaidInquiryResult>> postpaidInquiry({
    required int productItemId,
    required String customerNo,
  }) async {
    final response = await _apiClient.post(
      ApiEndpoints.postpaidInquiry,
      data: {
        'product_item_id': productItemId,
        'customer_no': customerNo,
      },
    );
    return ApiResponse.fromJson(
      response.data,
      (data) => PostpaidInquiryResult.fromJson(data),
    );
  }

  Future<ApiResponse<PostpaidPayResult>> postpaidPay({
    required String inquiryRef,
    required String paymentMethod,
    String? voucherCode,
  }) async {
    final response = await _apiClient.post(
      ApiEndpoints.postpaidPay,
      data: {
        'inquiry_ref': inquiryRef,
        'payment_method': paymentMethod,
        'voucher_code': voucherCode,
      },
    );
    return ApiResponse.fromJson(
      response.data,
      (data) => PostpaidPayResult.fromJson(data),
    );
  }
}
