import '../config/app_config.dart';

/// Chuẩn hóa URL ảnh từ API (`/uploads/...` hoặc absolute).
String resolveMediaUrl(String? url) {
  final raw = (url ?? '').trim();
  if (raw.isEmpty) return '';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;

  final path = raw.startsWith('/') ? raw : '/$raw';
  if (AppConfig.isDevelopment) {
    final apiBase = AppConfig.apiBaseUrl.replaceAll(RegExp(r'/api$'), '');
    return '$apiBase$path';
  }
  return path;
}
