import '../network/api_client.dart';
import '../constants/api_endpoints.dart';

class DeviceService {
  final ApiClient _apiClient;

  DeviceService(this._apiClient);

  Future<bool> registerDevice({
    required String deviceId,
    required String fcmToken,
    String? deviceName,
    required String platform,
  }) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.deviceRegister,
        data: {
          'device_id': deviceId,
          'fcm_token': fcmToken,
          'device_name': deviceName,
          'platform': platform,
        },
      );

      return response.data['success'] == true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> unregisterDevice(String deviceId) async {
    try {
      final response = await _apiClient.delete(
        ApiEndpoints.deviceDelete(deviceId),
      );
      return response.data['success'] == true;
    } catch (e) {
      return false;
    }
  }
}
