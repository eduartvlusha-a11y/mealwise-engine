import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mealwise_app/core/services/session_service.dart';

class OnboardingService {
  final String baseUrl = "http://10.0.2.2:3000";

  Future<bool> saveOnboarding(Map<String, dynamic> data) async {
    final token = await SessionService.getToken();

    if (token == null || token.isEmpty) {
      throw Exception("No token found");
    }

    final headers = {
      "Authorization": "Bearer $token",
      "Content-Type": "application/json",
    };

    // ✅ FIXED — correct endpoint
    final response = await http.post(
      Uri.parse("$baseUrl/onboarding/save"),
      headers: headers,
      body: jsonEncode(data),
    );

    print("ONBOARDING RESPONSE: ${response.statusCode} | ${response.body}");

    return response.statusCode == 200;
  }
}
