import '../network/api_client.dart';
import '../constants/api_endpoints.dart';
import '../models/api_response.dart';
import '../models/withdrawal.dart';

class WithdrawalService {
  final ApiClient _apiClient;

  WithdrawalService(this._apiClient);

  Future<ApiResponse<List<Withdrawal>>> getWithdrawals() async {
    try {
      final response = await _apiClient.get(ApiEndpoints.customerWithdrawals);
      return ApiResponse.fromJson(response.data, (data) {
        if (data is List) {
          return data.map((e) => Withdrawal.fromJson(e)).toList();
        }
        // Handle paginated response
        final list = data['data'] as List? ?? [];
        return list.map((e) => Withdrawal.fromJson(e)).toList();
      });
    } catch (e) {
      return ApiResponse(success: false, message: e.toString());
    }
  }

  Future<ApiResponse<Withdrawal>> createWithdrawal({
    required double amount,
    required String paymentMethod,
    required String accountNumber,
    required String accountName,
  }) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.customerWithdrawals,
        data: {
          'amount': amount,
          'payment_method': paymentMethod,
          'account_number': accountNumber,
          'account_name': accountName,
        },
      );
      return ApiResponse.fromJson(
        response.data,
        (data) => Withdrawal.fromJson(data),
      );
    } on Exception catch (e) {
      return ApiResponse(success: false, message: e.toString());
    }
  }
}
