import '../network/api_client.dart';
import '../constants/api_endpoints.dart';

class AppConfigService {
  final ApiClient _apiClient;

  AppConfigService(this._apiClient);

  Future<Map<String, dynamic>?> fetchConfig() async {
    try {
      final response = await _apiClient.get(ApiEndpoints.appConfig);
      if (response.data['success'] == true) {
        return response.data['data'];
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}
