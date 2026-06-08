import 'package:flutter/foundation.dart' show kIsWeb;

/// Biến môi trường compile-time (Flutter không có .env mặc định).
///
/// Cách gần .env nhất: file JSON + `--dart-define-from-file`
///   copy dart_defines.dev.example.json → dart_defines.dev.json
///   flutter run --dart-define-from-file=dart_defines.dev.json
enum AppEnvironment {
  development,
  production,
}

abstract final class AppConfig {
  static const _envRaw = String.fromEnvironment(
    'FLUTTER_ENV',
    defaultValue: 'development',
  );

  static const _apiFromEnv = String.fromEnvironment('API_BASE_URL');

  static const googleWebClientId = String.fromEnvironment(
    'GOOGLE_WEB_CLIENT_ID',
    defaultValue: '',
  );

  static AppEnvironment get environment {
    switch (_envRaw.trim().toLowerCase()) {
      case 'production':
      case 'prod':
        return AppEnvironment.production;
      default:
        return AppEnvironment.development;
    }
  }

  static bool get isDevelopment => environment == AppEnvironment.development;
  static bool get isProduction => environment == AppEnvironment.production;

  static String get envLabel =>
      isProduction ? 'production' : 'development';

  static String get apiBaseUrl {
    if (_apiFromEnv.isNotEmpty) {
      // Web/Chrome không truy cập được 10.0.2.2 (chỉ Android emulator)
      if (kIsWeb && _apiFromEnv.contains('10.0.2.2')) {
        return 'http://localhost:8080/api';
      }
      return _apiFromEnv;
    }
    if (isProduction) {
      return const String.fromEnvironment(
        'PROD_API_BASE_URL',
        defaultValue: 'https://api.cherryhouse.vn/api',
      );
    }
    if (kIsWeb) return 'http://localhost:8080/api';
    return 'http://10.0.2.2:8080/api';
  }
}
