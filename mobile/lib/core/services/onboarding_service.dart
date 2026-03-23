import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

import 'package:mealwise_app/core/services/session_service.dart';

class OnboardingService extends ChangeNotifier {
  // STEP 1
  String? height;
  String? weight;
  String? age;
  String? gender;

  // STEP 2
  String? goal;
  String? activityLevel;

  // STEP 3
  String? diet;
  List<String> allergies = [];

  // STEP 4
  String? budget;
  String? currency;

  // EXTRA — ULTRA BODY PREFERENCES
  Map<String, dynamic> preferences = {};

  final String baseUrl = "http://10.0.2.2:3000";

  // ---------------------------
  // STEP 1: personal data
  // ---------------------------
  void saveStep1({
    required String h,
    required String w,
    required String a,
    required String g,
    required String bodyType,
    required bool trainsRegularly,
  }) {
    height = h;
    weight = w;
    age = a;
    gender = g;

    preferences = {'bodyType': bodyType, 'trainsRegularly': trainsRegularly};

    notifyListeners();
  }

  // ---------------------------
  // STEP 2: goal + activity
  // ---------------------------
  void saveStep2({required String userGoal, required String userActivity}) {
    goal = userGoal;
    activityLevel = userActivity;
    notifyListeners();
  }

  // ---------------------------
  // STEP 3: diet + allergies
  // ---------------------------
  void saveStep3({
    required String selectedDiet,
    required List<String> selectedAllergies,
  }) {
    diet = selectedDiet;
    allergies = List<String>.from(selectedAllergies);
    notifyListeners();
  }

  // ---------------------------
  // STEP 4: budget + currency
  // ---------------------------
  void saveStep4({required String userBudget, required String userCurrency}) {
    budget = userBudget;
    currency = userCurrency;
    notifyListeners();
  }

  // ---------------------------
  // FINAL SUBMIT → calls backend /onboarding/save
  // ---------------------------
  Future<bool> submitOnboarding() async {
    final token = await SessionService.getToken();

    if (token == null || token.isEmpty) {
      debugPrint("❌ No auth token found");
      return false;
    }

    // ✅ THIS WAS MISSING — DEFINE PAYLOAD
    final payload = {
      "age": age,
      "gender": gender,
      "activityLevel": activityLevel,
      "goal": goal,
      "height": height,
      "weight": weight,
      "dietaryPreferences": diet,
      "allergies": allergies,
      "budget": budget,
      "country": currency,
      "preferences": null,
    };

    debugPrint("📤 SENDING ONBOARDING → $payload");

    final response = await http.post(
      Uri.parse("$baseUrl/onboarding/save"), // ✅ CORRECT ENDPOINT
      headers: {
        "Authorization": "Bearer $token",
        "Content-Type": "application/json",
      },
      body: jsonEncode(payload),
    );

    debugPrint(
      "✅ /onboarding/save RESPONSE: ${response.statusCode} | ${response.body}",
    );

    return response.statusCode == 200 || response.statusCode == 201;
  }
}
