import 'client.dart';
import 'config.dart';
import 'types.dart';

class TransactionService {
  static final TransactionService _instance = TransactionService._internal();

  factory TransactionService() {
    return _instance;
  }

  TransactionService._internal();

  Future<ApiResponse<PurchaseResponse>> guestPurchase(
    Map<String, dynamic> data,
  ) async {
    return await ApiClient().post<PurchaseResponse>(
      ApiConfig.endpoints.transactions.purchase,
      data: data,
      fromJson: (data) => PurchaseResponse.fromJson(data),
    );
  }

  Future<ApiResponse<TransactionStatus>> getTransactionStatus(
    String code,
  ) async {
    return await ApiClient().get<TransactionStatus>(
      ApiConfig.endpoints.transactions.status(code),
      fromJson: (data) => TransactionStatus.fromJson(data),
    );
  }

  Future<ApiResponse<List<PaymentChannel>>> getPaymentChannels() async {
    return await ApiClient().get<List<PaymentChannel>>(
      ApiConfig.endpoints.transactions.paymentChannels,
      fromJson: (data) =>
          (data as List).map((e) => PaymentChannel.fromJson(e)).toList(),
    );
  }

  Future<ApiResponse<void>> cancelTransaction(String code) async {
    return await ApiClient().post<void>(
      ApiConfig.endpoints.transactions.cancel(code),
      data: {},
    );
  }
}
