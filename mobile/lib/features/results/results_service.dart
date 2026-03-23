import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mealwise_app/core/services/session_service.dart';

class ResultsService {
  static const String _baseUrl = "http://10.0.2.2:3000";

  /// Fetch canonical MealwiseResults (metrics + strategy + reasoning)
  /// This endpoint is TRUST LAYER — not daily execution
  Future<Map<String, dynamic>> fetchResults() async {
    final token = await SessionService.getToken();
    if (token == null || token.isEmpty) {
      throw Exception("No auth token found");
    }

    final url = Uri.parse("$_baseUrl/mealwise/results");
    final response = await http.get(
      url,
      headers: {
        "Authorization": "Bearer $token",
        "Content-Type": "application/json",
      },
    );

    // DEBUG (keep for now)
    print("🌐 GET => $url");
    print("📥 STATUS => ${response.statusCode}");
    print("📥 BODY => ${response.body}");

    if (response.statusCode != 200) {
      throw Exception("Failed to load MealwiseResults: ${response.statusCode}");
    }

    final decoded = jsonDecode(response.body);

    if (decoded is! Map) {
      throw Exception("Invalid response format");
    }

    final map = Map<String, dynamic>.from(decoded);

    // ✅ IMPORTANT:
    // If backend returns { results: { metrics, strategy, reasoning }, ... }
    // extract results.
    if (map['results'] is Map) {
      return Map<String, dynamic>.from(map['results'] as Map);
    }

    // If backend already returns { metrics, strategy, reasoning }
    return map;
  }
}
