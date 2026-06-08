import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';

import '../api/api_client.dart';
import '../api/auth_api.dart';
import '../config/app_config.dart';
import '../models/user.dart';
import 'auth_storage.dart';

class AuthController extends ChangeNotifier {
  AuthController() {
    _api = AuthApi(_client);
  }

  final ApiClient _client = ApiClient();
  late final AuthApi _api;

  AppUser? _user;
  String? _token;
  bool _bootstrapping = true;

  AppUser? get user => _user;
  bool get isLoggedIn => _token != null && _token!.isNotEmpty;
  bool get isBootstrapping => _bootstrapping;

  Future<void> bootstrap() async {
    final session = await AuthStorage.loadSession();
    if (session != null) {
      _token = session.token;
      _user = session.user;
      _client.setToken(_token);
      try {
        _user = await _api.fetchMe();
        await AuthStorage.saveSession(AuthSession(token: _token!, user: _user!));
      } catch (_) {
        await logout();
      }
    }
    _bootstrapping = false;
    notifyListeners();
  }

  Future<void> _persist(AuthSession session) async {
    _token = session.token;
    _user = session.user;
    _client.setToken(_token);
    await AuthStorage.saveSession(session);
    notifyListeners();
  }

  Future<SendOtpResult> sendRegisterOtp({
    required String fullName,
    required String email,
    String? phone,
    required String password,
  }) {
    return _api.sendRegisterOtp(
      fullName: fullName,
      email: email,
      phone: phone,
      password: password,
    );
  }

  Future<void> verifyRegisterOtp({
    required String email,
    required String otp,
  }) async {
    final session = await _api.verifyRegisterOtp(email: email, otp: otp);
    await _persist(session);
  }

  Future<void> login({
    required String email,
    required String password,
  }) async {
    final session = await _api.login(email: email, password: password);
    await _persist(session);
  }

  Future<void> signInWithGoogle() async {
    if (AppConfig.googleWebClientId.isEmpty) {
      throw Exception(
        'Chưa cấu hình GOOGLE_WEB_CLIENT_ID. Chạy: flutter run --dart-define=GOOGLE_WEB_CLIENT_ID=...',
      );
    }
    // Web bắt buộc clientId; Android/iOS dùng serverClientId để lấy idToken
    final google = GoogleSignIn(
      scopes: const ['email', 'profile'],
      clientId: kIsWeb ? AppConfig.googleWebClientId : null,
      serverClientId: AppConfig.googleWebClientId,
    );
    final account = await google.signIn();
    if (account == null) return;
    final auth = await account.authentication;
    final idToken = auth.idToken;
    if (idToken == null) {
      throw Exception('Google không trả idToken');
    }
    final session = await _api.googleMobile(idToken: idToken);
    await _persist(session);
  }

  Future<void> refreshProfile() async {
    if (!isLoggedIn) return;
    _user = await _api.fetchMe();
    await AuthStorage.saveSession(AuthSession(token: _token!, user: _user!));
    notifyListeners();
  }

  Future<void> logout() async {
    _token = null;
    _user = null;
    _client.setToken(null);
    await AuthStorage.clear();
    notifyListeners();
  }
}
