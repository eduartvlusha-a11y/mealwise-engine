import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../services/session_service.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;

  final Dio dio = Dio();
  final storage = const FlutterSecureStorage();

  ApiService._internal() {
    dio.options.baseUrl = "http://10.0.2.2:3000";
    dio.options.connectTimeout = const Duration(seconds: 10);
    dio.options.receiveTimeout = const Duration(seconds: 10);

    dio.interceptors.clear();

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await SessionService.getToken();

          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          print('🧪 AUTH HEADER => ${options.headers['Authorization']}');

          return handler.next(options);
        },
      ),
    );
  }

  // Example GET request
  Future<Response> get(String path) async {
    return await dio.get(path);
  }

  // Example POST request
  Future<Response> post(String path, {Map<String, dynamic>? data}) async {
    return await dio.post(path, data: data);
  }

  // Example PATCH request
  Future<Response> patch(String path, {Map<String, dynamic>? data}) async {
    return await dio.patch(path, data: data);
  }

  Future<void> login(String email, String password) async {
    final response = await post(
      '/auth/login',
      data: {'email': email, 'password': password},
    );

    print('🧪 LOGIN RESPONSE => ${response.data}');

    final token = response.data['access_token'];

    if (token != null) {
      await SessionService.saveToken(token);
    }
  }
}
