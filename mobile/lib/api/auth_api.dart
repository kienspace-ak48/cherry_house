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

  AuthSession _sessionFromJson(Map<String, dynamic> data) {
    return AuthSession(
      token: data['token'] as String,
      user: AppUser.fromJson(data['user'] as Map<String, dynamic>),
    );
  }
}
