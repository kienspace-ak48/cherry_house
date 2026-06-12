import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/app_config.dart';

class ApiException implements Exception {
  ApiException(this.message, {this.statusCode, this.code});

  final String message;
  final int? statusCode;
  final String? code;

  @override
  String toString() => message;
}

class ApiClient {
  ApiClient({http.Client? client, String? token}) : _client = client ?? http.Client() {
    _token = token;
  }

  final http.Client _client;
  String? _token;
  String? _refreshToken;

  Future<String?> Function()? getRefreshToken;
  Future<void> Function(String accessToken, String? refreshToken)? onTokensRefreshed;
  Future<void> Function()? onSessionExpired;

  bool _refreshing = false;

  void setToken(String? token) => _token = token;
  void setRefreshToken(String? token) => _refreshToken = token;

  Uri _uri(String path, [Map<String, String>? query]) {
    final base = AppConfig.apiBaseUrl.replaceAll(RegExp(r'/$'), '');
    final p = path.startsWith('/') ? path : '/$path';
    return Uri.parse('$base$p').replace(queryParameters: query);
  }

  Future<Map<String, dynamic>> get(
    String path, {
    Map<String, String>? query,
    bool retryOn401 = true,
  }) async {
    return _request('GET', path, query: query, retryOn401: retryOn401);
  }

  Future<Map<String, dynamic>> post(
    String path,
    Map<String, dynamic> body, {
    bool retryOn401 = true,
  }) async {
    return _request('POST', path, body: body, retryOn401: retryOn401);
  }

  Future<Map<String, dynamic>> _request(
    String method,
    String path, {
    Map<String, String>? query,
    Map<String, dynamic>? body,
    bool retryOn401 = true,
  }) async {
    var res = await _send(method, path, query: query, body: body);
    var parsed = _parse(res);

    if (retryOn401 &&
        res.statusCode == 401 &&
        (parsed['code'] == 'ACCESS_TOKEN_EXPIRED' || parsed['code'] == 'AUTH_REQUIRED')) {
      if (await _tryRefresh()) {
        res = await _send(method, path, query: query, body: body);
        parsed = _parse(res);
      }
    }

    if (res.statusCode >= 400 || parsed['success'] == false) {
      throw ApiException(
        parsed['message'] as String? ?? 'Yêu cầu thất bại',
        statusCode: res.statusCode,
        code: parsed['code'] as String?,
      );
    }
    return parsed;
  }

  Future<http.Response> _send(
    String method,
    String path, {
    Map<String, String>? query,
    Map<String, dynamic>? body,
  }) {
    final uri = _uri(path, query);
    final headers = _headers();
    switch (method) {
      case 'GET':
        return _client.get(uri, headers: headers);
      case 'POST':
        return _client.post(uri, headers: headers, body: jsonEncode(body ?? {}));
      default:
        throw ApiException('Unsupported method $method');
    }
  }

  Map<String, String> _headers() {
    final h = <String, String>{'Content-Type': 'application/json'};
    if (_token != null && _token!.isNotEmpty) {
      h['Authorization'] = 'Bearer $_token';
    }
    return h;
  }

  Map<String, dynamic> _parse(http.Response res) {
    Map<String, dynamic> json;
    try {
      json = jsonDecode(res.body) as Map<String, dynamic>;
    } catch (_) {
      throw ApiException('Phản hồi không hợp lệ từ server', statusCode: res.statusCode);
    }
    return json;
  }

  Future<bool> _tryRefresh() async {
    if (_refreshing) return false;
    final rt = _refreshToken ?? await getRefreshToken?.call();
    if (rt == null || rt.isEmpty) {
      await onSessionExpired?.call();
      return false;
    }
    _refreshing = true;
    try {
      final res = await _client.post(
        _uri('/auth/refresh'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'refreshToken': rt}),
      );
      final json = _parse(res);
      if (res.statusCode >= 400 || json['success'] == false) {
        await onSessionExpired?.call();
        return false;
      }
      final data = json['data'] as Map<String, dynamic>;
      final access = data['token'] as String? ?? data['accessToken'] as String?;
      final newRefresh = data['refreshToken'] as String? ?? rt;
      if (access == null || access.isEmpty) return false;
      _token = access;
      _refreshToken = newRefresh;
      await onTokensRefreshed?.call(access, newRefresh);
      return true;
    } catch (_) {
      await onSessionExpired?.call();
      return false;
    } finally {
      _refreshing = false;
    }
  }
}
