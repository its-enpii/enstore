import '../network/api_client.dart';
import '../constants/api_endpoints.dart';
import '../models/api_response.dart';
import '../models/transaction.dart';

class TransactionService {
  final ApiClient _apiClient;

  TransactionService(this._apiClient);

  Future<ApiResponse<PurchaseResponse>> guestPurchase(
    Map<String, dynamic> data,
  ) async {
    final response = await _apiClient.post(
      ApiEndpoints.publicPurchase,
      data: data,
    );
    return ApiResponse.fromJson(
      response.data,
      (data) => PurchaseResponse.fromJson(data),
    );
  }

  Future<ApiResponse<PurchaseResponse>> customerPurchase(
    Map<String, dynamic> data,
  ) async {
    final response = await _apiClient.post(
      ApiEndpoints.customerPurchase,
      data: data,
    );
    return ApiResponse.fromJson(
      response.data,
      (data) => PurchaseResponse.fromJson(data),
    );
  }

  Future<ApiResponse<PurchaseResponse>> customerBalancePurchase(
    Map<String, dynamic> data,
  ) async {
    final response = await _apiClient.post(
      ApiEndpoints.customerBalancePurchase,
      data: data,
    );
    return ApiResponse.fromJson(
      response.data,
      (data) => PurchaseResponse.fromJson(data),
    );
  }

  Future<ApiResponse<TransactionStatusModel>> getTransactionStatus(
    String code,
  ) async {
    final response = await _apiClient.get(
      ApiEndpoints.publicTransactionStatus(code),
    );
    return ApiResponse.fromJson(
      response.data,
      (data) => TransactionStatusModel.fromJson(data),
    );
  }

  Future<ApiResponse<List<PaymentChannel>>> getPaymentChannels() async {
    final response = await _apiClient.get(ApiEndpoints.publicPaymentChannels);
    return ApiResponse.fromJson(
      response.data,
      (data) => (data as List).map((e) => PaymentChannel.fromJson(e)).toList(),
    );
  }

  Future<ApiResponse<void>> cancelTransaction(String code) async {
    final response = await _apiClient.post(
      ApiEndpoints.publicTransactionCancel(code),
      data: {},
    );
    return ApiResponse.fromJson(response.data, (_) {});
  }
}
