import 'package:mealwise_app/core/services/api_service.dart';

class UpgradeService {
  final ApiService api;

  UpgradeService(this.api);

  Future<Map<String, dynamic>> upgradeToPro() async {
    final res = await api.post('/payments/subscribe');
    return res;
  }
}
