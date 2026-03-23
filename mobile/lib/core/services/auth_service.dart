import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:mealwise_app/core/services/session_service.dart';

class AuthService {
  static String get baseUrl {
    if (kIsWeb) {
      return "http://localhost:3000";
    } else {
      return "http://10.0.2.2:3000";
    }
  }

  // REGISTER
  Future<bool> register({
    required String email,
    required String password,
  }) async {
    final url = Uri.parse("$baseUrl/auth/register");

    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"email": email, "password": password}),
    );

    return response.statusCode == 200 || response.statusCode == 201;
  }

  // LOGIN
  Future<bool> login(String email, String password) async {
    final url = Uri.parse("$baseUrl/auth/login");

    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"email": email, "password": password}),
    );

    print("Login response: ${response.statusCode} — ${response.body}");

    if (response.statusCode == 200 || response.statusCode == 201) {
      final data = jsonDecode(response.body);

      final token = data["access_token"];
      print('🔥 TOKEN RECEIVED FROM BACKEND => $token');

      if (token != null) {
        print("Saving token: $token");
        await SessionService.saveToken(token); // ⭐ SAVE THE TOKEN ⭐
        return true;
      }
    }

    return false;
  }

  // LOGOUT (✔ FIXED — now inside the class)
  Future<void> logout() async {
    await SessionService.clearToken();
  }
}
