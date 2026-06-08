import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../models/user.dart';

abstract final class AuthStorage {
  static const _tokenKey = 'cherry_mobile_token';
  static const _userKey = 'cherry_mobile_user';

  static Future<AuthSession?> loadSession() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_tokenKey);
    final userRaw = prefs.getString(_userKey);
    if (token == null || token.isEmpty || userRaw == null) return null;
    try {
      final user = AppUser.fromJson(jsonDecode(userRaw) as Map<String, dynamic>);
      return AuthSession(token: token, user: user);
    } catch (_) {
      return null;
    }
  }

  static Future<void> saveSession(AuthSession session) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, session.token);
    await prefs.setString(_userKey, jsonEncode(session.user.toJson()));
  }

  static Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
  }
}
