import '../network/api_client.dart';
import '../constants/api_endpoints.dart';
import '../models/api_response.dart';

class UtilityService {
  final ApiClient _apiClient;

  UtilityService(this._apiClient);

  /// Mencari provider berdasarkan nomor telepon.
  /// Contoh: 085846... -> Indosat
  Future<ApiResponse<Map<String, dynamic>>> lookupProvider(String phone) async {
    try {
      final response = await _apiClient.get(
        ApiEndpoints.lookupProvider,
        queryParameters: {'phone': phone},
      );

      return ApiResponse.fromJson(
        response.data,
        (data) => data as Map<String, dynamic>,
      );
    } catch (e) {
      return ApiResponse(success: false, message: e.toString());
    }
  }
}
