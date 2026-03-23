import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mealwise_app/core/services/session_service.dart';

class HomeService {
  final String baseUrl = "http://10.0.2.2:3000";

  /// ULTRA: Single source of truth.
  /// We fetch /mealwise/results, keep raw structure, and add only derived fields
  /// needed for UI: todayPlan + compatibility keys.
  Future<Map<String, dynamic>> getHomeData() async {
    final token = await SessionService.getToken();

    if (token == null || token.isEmpty) {
      throw Exception("No token found");
    }

    // ✅ ULTRA: Use the REAL orchestrated endpoint

    final response = await http.get(
      Uri.parse("$baseUrl/mealwise/premium-home"),

      headers: {
        "Authorization": "Bearer $token",
        "Content-Type": "application/json",
      },
    );

    if (response.statusCode != 200) {
      throw Exception("Results API failed: ${response.statusCode}");
    }

    final raw = jsonDecode(response.body) as Map<String, dynamic>;
    // 🔒 HARD GATES — STOP FLOW IMMEDIATELY
    if (raw['needsOnboarding'] == true) {
      return {'needsOnboarding': true, 'hasPlan': false};
    }

    if (raw['hasPlan'] == false) {
      return {'needsOnboarding': false, 'hasPlan': false};
    }

    // If backend says NO_PLAN, return a minimal ultra-safe shape.
    // (We DO NOT fabricate meals or calories.)
    if (raw["status"] == "NO_PLAN") {
      return {
        "status": "NO_PLAN",
        "weekPlan": {"days": []},
        "results": raw["results"] ?? {},
        "metrics": raw["metrics"] ?? (raw["results"]?["metrics"] ?? {}),
        "todayPlan": null,

        // Compatibility keys for current UI (empty, honest)
        "today": {
          "meals": [],
          "calories": 0,
          "groceryPricing": {"currency": raw["pricing"]?["currency"] ?? "EUR"},
        },
        "weekly": {"totalCalories": 0, "totalSpent": 0},
        "insights": {
          "health": "Start your first plan to unlock insights",
          "budget": "No active plan yet",
        },
      };
    }

    // -----------------------------
    // ULTRA: derive todayPlan from weekPlan.days[]
    // -----------------------------
    final weekPlan = (raw["weekPlan"] as Map?)?.cast<String, dynamic>() ?? {};
    final days = (weekPlan["days"] as List?)?.cast<dynamic>() ?? [];

    final todayISO = DateTime.now().toIso8601String().split('T').first;

    Map<String, dynamic>? todayDay;
    for (final d in days) {
      final map = (d as Map).cast<String, dynamic>();
      final dateStr = map["date"]?.toString() ?? "";
      if (dateStr.startsWith(todayISO)) {
        todayDay = map;
        break;
      }
    }

    final todayPlan = (todayDay?["plan"] as Map?)?.cast<String, dynamic>();

    // Meals list (planned) - honest.
    final meals = (todayPlan?["meals"] as List?)?.cast<dynamic>() ?? [];

    print("🧪 todayISO => $todayISO");
    print("🧪 days dates => ${days.map((d) => (d as Map)['date']).toList()}");
    print("🧪 todayDay found => ${todayDay?['date']}");
    print("🧪 meals count => ${meals.length}");

    // Planned calories today (may be 0 depending on backend stage — allowed)
    int totalCaloriesToday = 0;
    for (final m in meals) {
      final mm = (m as Map).cast<String, dynamic>();
      totalCaloriesToday += (mm["calories"] as num?)?.toInt() ?? 0;
    }

    // -----------------------------
    // ULTRA: keep canonical metrics/strategy/reasoning
    // -----------------------------
    final results = (raw["results"] as Map?)?.cast<String, dynamic>() ?? {};
    final metrics =
        (results["metrics"] as Map?)?.cast<String, dynamic>() ??
        (raw["metrics"] as Map?)?.cast<String, dynamic>() ??
        {};

    final strategy =
        (results["strategy"] as Map?)?.cast<String, dynamic>() ?? {};
    final reasoning = (results["reasoning"] as List?)?.cast<dynamic>() ?? [];

    final currency = (raw["pricing"] as Map?)?["currency"]?.toString() ?? "EUR";

    final weeklyCalories =
        (metrics["weeklyCaloriesTarget"] as num?)?.toInt() ?? 0;
    final weeklyBudget = (metrics["weeklyBudget"] as num?)?.toDouble() ?? 0.0;

    // -----------------------------
    // ✅ FINAL ULTRA STRUCTURE
    // - keep raw + add derived todayPlan
    // - add compatibility keys so current UI renders while we migrate
    // -----------------------------
    return {
      ...raw,

      // Canonical ultra keys
      "weekPlan": weekPlan,
      "todayPlan": todayPlan,
      "results": results,
      "metrics": metrics,
      "strategy": strategy,
      "reasoning": reasoning,

      // Compatibility keys (upgrade-safe)
      "today": {
        "meals": meals,
        "calories": totalCaloriesToday,
        "groceryPricing": {"currency": currency},
      },
      "weekly": {
        "totalCalories": weeklyCalories,
        "totalSpent": weeklyBudget, // planned budget (not actual spend)
      },
      "insights": {
        "health": strategy["macroFocus"] != null
            ? "Focus: ${strategy["macroFocus"]}"
            : "Focus on balance",
        "budget": weeklyBudget > 0
            ? "Planned weekly budget: $weeklyBudget"
            : "Set a weekly budget",
      },
    };
  }

  /// Keep this for debugging if you still use it elsewhere.
  Future<Map<String, dynamic>> getResults() async {
    final token = await SessionService.getToken();

    if (token == null || token.isEmpty) {
      throw Exception("No token found");
    }

    final response = await http.get(
      Uri.parse("$baseUrl/mealwise/results"),
      headers: {
        "Authorization": "Bearer $token",
        "Content-Type": "application/json",
      },
    );

    if (response.statusCode != 200) {
      throw Exception("Results API failed: ${response.statusCode}");
    }

    final raw = jsonDecode(response.body) as Map<String, dynamic>;
    print("📦 RAW RESULTS JSON => $raw");
    return raw;
  }

  Future<void> startPlan() async {
    final token = await SessionService.getToken();

    if (token == null || token.isEmpty) {
      throw Exception("No token");
    }

    final response = await http.post(
      Uri.parse("$baseUrl/mealwise/start"),
      headers: {
        "Authorization": "Bearer $token",
        "Content-Type": "application/json",
      },
    );

    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception("Start plan failed");
    }
  }

  /// 🔁 Regenerate weekly plan (after profile changes)
  Future<void> regenerateWeek() async {
    final token = await SessionService.getToken();

    if (token == null || token.isEmpty) {
      throw Exception("No token");
    }

    final response = await http.post(
      Uri.parse("$baseUrl/mealwise/regenerate-week"),
      headers: {
        "Authorization": "Bearer $token",
        "Content-Type": "application/json",
      },
    );

    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception("Regenerate plan failed");
    }
  }

  Future<void> logFood({
    required String name,
    required String meal,
    required double calories,
    required double protein,
    required double carbs,
    required double fat,
    double grams = 0,
    String? templateId,
  }) async {
    final token = await SessionService.getToken();

    if (token == null || token.isEmpty) {
      throw Exception("No token");
    }

    final response = await http.post(
      Uri.parse("$baseUrl/mealwise/food-log"),
      headers: {
        "Authorization": "Bearer $token",
        "Content-Type": "application/json",
      },
      body: jsonEncode({
        "name": name,
        "meal": meal,
        "calories": calories,
        "protein": protein,
        "carbs": carbs,
        "fat": fat,
        "grams": grams,
        "templateId": templateId,
      }),
    );

    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception("FoodLog failed: ${response.body}");
    }
  }

  Future<List<Map<String, dynamic>>> getTodayEatenMeals() async {
    final token = await SessionService.getToken();

    final response = await http.get(
      Uri.parse("$baseUrl/mealwise/food-log/today"),
      headers: {
        "Authorization": "Bearer $token",
        "Content-Type": "application/json",
      },
    );

    if (response.statusCode != 200) {
      throw Exception("Failed to load eaten meals");
    }

    final List data = jsonDecode(response.body);
    return data.cast<Map<String, dynamic>>();
  }
}
