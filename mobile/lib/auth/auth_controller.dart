import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';

import '../api/auth_api.dart';
import '../app_services.dart';
import '../config/app_config.dart';
import '../models/user.dart';
import 'auth_storage.dart';

class AuthController extends ChangeNotifier {
  AuthController() {
    _api = AppServices.I.authApi;
    _wireClientCallbacks();
  }

  late final AuthApi _api;

  AppUser? _user;
  String? _token;
  String? _refreshToken;
  bool _bootstrapping = true;

  AppUser? get user => _user;
  bool get isLoggedIn => _token != null && _token!.isNotEmpty;
  bool get isBootstrapping => _bootstrapping;

  void _wireClientCallbacks() {
    AppServices.I.apiClient.getRefreshToken = () async => _refreshToken;
    AppServices.I.apiClient.onTokensRefreshed = (access, refresh) async {
      _token = access;
      if (refresh != null && refresh.isNotEmpty) _refreshToken = refresh;
      if (_user != null) {
        await AuthStorage.saveSession(
          AuthSession(token: access, refreshToken: _refreshToken, user: _user!),
        );
      }
      notifyListeners();
    };
    AppServices.I.apiClient.onSessionExpired = () async {
      await logout();
    };
  }

  Future<void> bootstrap() async {
    final session = await AuthStorage.loadSession();
    if (session != null) {
      _token = session.token;
      _refreshToken = session.refreshToken;
      _user = session.user;
      AppServices.I.apiClient.setToken(_token);
      AppServices.I.apiClient.setRefreshToken(_refreshToken);
      try {
        _user = await _api.fetchMe();
        await AuthStorage.saveSession(
          AuthSession(token: _token!, refreshToken: _refreshToken, user: _user!),
        );
      } catch (_) {
        await logout();
      }
    }
    _bootstrapping = false;
    notifyListeners();
  }

  Future<void> _persist(AuthSession session) async {
    _token = session.token;
    _refreshToken = session.refreshToken;
    _user = session.user;
    AppServices.I.apiClient.setToken(_token);
    AppServices.I.apiClient.setRefreshToken(_refreshToken);
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
    await AuthStorage.saveSession(
      AuthSession(token: _token!, refreshToken: _refreshToken, user: _user!),
    );
    notifyListeners();
  }

  Future<void> logout() async {
    await _api.logout(refreshToken: _refreshToken);
    _token = null;
    _refreshToken = null;
    _user = null;
    AppServices.I.apiClient.setToken(null);
    AppServices.I.apiClient.setRefreshToken(null);
    await AuthStorage.clear();
    notifyListeners();
  }
}
