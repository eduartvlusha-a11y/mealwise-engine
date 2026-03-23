import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SessionService {
  static const _storage = FlutterSecureStorage();
  static const String _tokenKey = 'token';

  // SAVE TOKEN
  static Future<void> saveToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  // READ TOKEN
  static Future<String?> getToken() async {
    final token = await _storage.read(key: _tokenKey);
    return token;
  }

  // CLEAR TOKEN
  static Future<void> clearToken() async {
    await _storage.delete(key: _tokenKey);
  }
}
