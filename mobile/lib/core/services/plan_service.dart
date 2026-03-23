import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:mealwise_app/core/services/session_service.dart';

class PlanService {
  static String get baseUrl {
    if (kIsWeb) {
      return "http://localhost:3000";
    } else {
      return "http://10.0.2.2:3000";
    }
  }

  // GET ACTIVE PLAN
  Future<Map<String, dynamic>?> getActivePlan() async {
    final token = await SessionService.getToken();
    if (token == null) return null;

    final url = Uri.parse("$baseUrl/plans/active");

    final response = await http.get(
      url,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer $token",
      },
    );

    if (response.statusCode == 200 && response.body.isNotEmpty) {
      return jsonDecode(response.body);
    }

    return null;
  }

  // START PLAN
  Future<Map<String, dynamic>?> startPlan() async {
    final token = await SessionService.getToken();
    if (token == null) return null;

    final url = Uri.parse("$baseUrl/plans/start");

    final response = await http.post(
      url,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer $token",
      },
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body);
    }

    return null;
  }
}
