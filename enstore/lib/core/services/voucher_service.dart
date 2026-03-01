import '../models/api_response.dart';
import '../models/voucher.dart';
import '../network/api_client.dart';
import '../constants/api_endpoints.dart';

class VoucherService {
  final ApiClient _apiClient;

  VoucherService(this._apiClient);

  Future<ApiResponse<List<VoucherModel>>> getVouchers() async {
    final response = await _apiClient.get(ApiEndpoints.vouchers);
    return ApiResponse.fromJson(
      response.data,
      (data) => (data as List)
          .map((item) => VoucherModel.fromJson(item))
          .toList(),
    );
  }
}
