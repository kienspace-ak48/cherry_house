import '../models/user.dart';
import 'api_client.dart';

class SendOtpResult {
  const SendOtpResult({
    required this.email,
    required this.expiresAt,
    this.debugOtp,
  });

  final String email;
  final DateTime expiresAt;
  final String? debugOtp;
}

class AuthApi {
  AuthApi(this._client);

  final ApiClient _client;

  Future<SendOtpResult> sendRegisterOtp({
    required String fullName,
    required String email,
    String? phone,
    required String password,
  }) async {
    final json = await _client.post('/auth/register/send-otp', {
      'fullName': fullName,
      'email': email,
      if (phone != null && phone.isNotEmpty) 'phone': phone,
      'password': password,
    });
    final data = json['data'] as Map<String, dynamic>;
    return SendOtpResult(
      email: data['email'] as String,
      expiresAt: DateTime.parse(data['expiresAt'] as String),
      debugOtp: data['debugOtp'] as String?,
    );
  }

  Future<AuthSession> verifyRegisterOtp({
    required String email,
    required String otp,
  }) async {
    final json = await _client.post('/auth/register/verify-otp', {
      'email': email,
      'otp': otp,
    });
    return _sessionFromJson(json['data'] as Map<String, dynamic>);
  }

  Future<AuthSession> login({
    required String email,
    required String password,
  }) async {
    final json = await _client.post('/auth/login', {
      'email': email,
      'password': password,
    });
    return _sessionFromJson(json['data'] as Map<String, dynamic>);
  }

  Future<AuthSession> googleMobile({required String idToken}) async {
    final json = await _client.post('/auth/google/mobile', {'idToken': idToken});
    return _sessionFromJson(json['data'] as Map<String, dynamic>);
  }

  Future<AppUser> fetchMe() async {
    final json = await _client.get('/auth/me');
    return AppUser.fromJson(json['data'] as Map<String, dynamic>);
  }

  Future<Map<String, dynamic>> requestEmailChange({
    required String newEmail,
    String? currentPassword,
  }) async {
    final body = <String, dynamic>{'newEmail': newEmail.trim()};
    if (currentPassword != null && currentPassword.isNotEmpty) {
      body['currentPassword'] = currentPassword;
    }
    final json = await _client.post('/auth/change-email/request', body);
    return json['data'] as Map<String, dynamic>;
  }

  Future<AppUser> confirmEmailChange({required String otp}) async {
    final json = await _client.post('/auth/change-email/confirm', {'otp': otp.trim()});
    return AppUser.fromJson(json['data'] as Map<String, dynamic>);
  }

  Future<Map<String, dynamic>> requestPasswordReset({required String email}) async {
    final json = await _client.post('/auth/forgot-password/request', {
      'email': email.trim(),
    });
    return json['data'] as Map<String, dynamic>;
  }

  Future<void> confirmPasswordReset({
    required String email,
    required String otp,
    required String newPassword,
  }) async {
    await _client.post('/auth/forgot-password/confirm', {
      'email': email.trim(),
      'otp': otp.trim(),
      'newPassword': newPassword,
    });
  }

  Future<AppUser> updateProfile({
    String? fullName,
    String? phone,
    Map<String, String>? profileMeta,
  }) async {
    final body = <String, dynamic>{};
    if (fullName != null) body['fullName'] = fullName;
    if (phone != null) body['phone'] = phone.isEmpty ? null : phone;
    if (profileMeta != null) body['profileMeta'] = profileMeta;
    final json = await _client.patch('/auth/me', body);
    return AppUser.fromJson(json['data'] as Map<String, dynamic>);
  }

  Future<void> logout({String? refreshToken}) async {
    if (refreshToken != null && refreshToken.isNotEmpty) {
      try {
        await _client.post('/auth/logout', {'refreshToken': refreshToken});
      } catch (_) {}
    }
  }

  AuthSession _sessionFromJson(Map<String, dynamic> data) {
    return AuthSession(
      token: (data['token'] as String?) ?? (data['accessToken'] as String?) ?? '',
      refreshToken: data['refreshToken'] as String?,
      user: AppUser.fromJson(data['user'] as Map<String, dynamic>),
    );
  }
}
