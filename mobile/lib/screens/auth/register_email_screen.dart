import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../../auth/auth_controller.dart';
import '../../theme/app_colors.dart';
import '../../widgets/auth_shell.dart';

class RegisterEmailScreen extends StatefulWidget {
  const RegisterEmailScreen({super.key});

  @override
  State<RegisterEmailScreen> createState() => _RegisterEmailScreenState();
}

class _RegisterEmailScreenState extends State<RegisterEmailScreen> {
  final _fullName = TextEditingController();
  final _email = TextEditingController();
  final _phone = TextEditingController();
  final _password = TextEditingController();
  final _confirm = TextEditingController();
  final _otp = TextEditingController();

  bool _stepOtp = false;
  bool _loading = false;
  String? _error;
  String? _debugOtp;
  DateTime? _expiresAt;
  int _secondsLeft = 0;
  Timer? _timer;

  @override
  void dispose() {
    _timer?.cancel();
    _fullName.dispose();
    _email.dispose();
    _phone.dispose();
    _password.dispose();
    _confirm.dispose();
    _otp.dispose();
    super.dispose();
  }

  bool get _otpExpired => _stepOtp && _secondsLeft == 0 && _expiresAt != null;

  void _startCountdown(DateTime expiresAt) {
    _timer?.cancel();
    _expiresAt = expiresAt;
    void tick() {
      final left = expiresAt.difference(DateTime.now()).inSeconds;
      setState(() => _secondsLeft = left < 0 ? 0 : left);
    }
    tick();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) => tick());
  }

  String _formatCountdown(int sec) {
    final m = sec ~/ 60;
    final s = sec % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  Future<void> _sendOtp() async {
    if (_password.text.length < 6) {
      setState(() => _error = 'Mật khẩu tối thiểu 6 ký tự');
      return;
    }
    if (_password.text != _confirm.text) {
      setState(() => _error = 'Mật khẩu nhập lại không khớp');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final result = await context.read<AuthController>().sendRegisterOtp(
            fullName: _fullName.text.trim(),
            email: _email.text.trim(),
            phone: _phone.text.trim().isEmpty ? null : _phone.text.trim(),
            password: _password.text,
          );
      setState(() {
        _debugOtp = result.debugOtp;
        _stepOtp = true;
        _otp.clear();
      });
      _startCountdown(result.expiresAt);
    } catch (e) {
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _verifyOtp() async {
    if (_otpExpired) {
      setState(() => _error = 'Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await context.read<AuthController>().verifyRegisterOtp(
            email: _email.text.trim(),
            otp: _otp.text.trim(),
          );
      if (mounted) {
        Navigator.popUntil(context, (r) => r.isFirst);
      }
    } catch (e) {
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      setState(() => _loading = false);
    }
  }

  void _backToForm() {
    _timer?.cancel();
    setState(() {
      _stepOtp = false;
      _otp.clear();
      _expiresAt = null;
      _secondsLeft = 0;
      _error = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return AuthShell(
      title: _stepOtp ? 'Nhập mã OTP' : 'Đăng ký bằng Email',
      subtitle: _stepOtp
          ? 'Mã đã gửi tới ${_email.text.trim()}.'
          : 'Chúng tôi gửi mã 6 số qua email để xác thực.',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (_error != null) _errorBox(_error!),
          if (_debugOtp != null)
            Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.amber.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.amber.shade200),
              ),
              child: Text('Dev mode — OTP: $_debugOtp', style: const TextStyle(fontSize: 13)),
            ),
          if (_stepOtp) ...[
            _countdownBanner(),
            TextField(
              controller: _otp,
              keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(6)],
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, letterSpacing: 8),
              decoration: const InputDecoration(labelText: 'Mã OTP (6 số)'),
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: (_loading || _otp.text.length != 6 || _otpExpired) ? null : _verifyOtp,
              style: FilledButton.styleFrom(backgroundColor: AppColors.primary, padding: const EdgeInsets.symmetric(vertical: 14)),
              child: Text(_loading ? 'Đang xác thực...' : 'Hoàn tất đăng ký'),
            ),
            TextButton(
              onPressed: _backToForm,
              child: Text(_otpExpired ? 'Gửi lại OTP' : 'Sửa thông tin / gửi lại OTP'),
            ),
          ] else ...[
            TextField(controller: _fullName, decoration: const InputDecoration(labelText: 'Họ và tên')),
            const SizedBox(height: 12),
            TextField(controller: _email, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'Email')),
            const SizedBox(height: 12),
            TextField(controller: _phone, keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: 'Số điện thoại (tuỳ chọn)')),
            const SizedBox(height: 12),
            TextField(controller: _password, obscureText: true, decoration: const InputDecoration(labelText: 'Mật khẩu')),
            const SizedBox(height: 12),
            TextField(controller: _confirm, obscureText: true, decoration: const InputDecoration(labelText: 'Nhập lại mật khẩu')),
            const SizedBox(height: 20),
            FilledButton(
              onPressed: _loading ? null : _sendOtp,
              style: FilledButton.styleFrom(backgroundColor: AppColors.primary, padding: const EdgeInsets.symmetric(vertical: 14)),
              child: Text(_loading ? 'Đang gửi OTP...' : 'Gửi mã xác thực'),
            ),
          ],
        ],
      ),
    );
  }

  Widget _errorBox(String msg) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.red.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.red.shade200),
      ),
      child: Text(msg, style: TextStyle(color: Colors.red.shade800, fontSize: 13)),
    );
  }

  Widget _countdownBanner() {
    Color bg;
    Color border;
    Color text;
    String label;
    if (_otpExpired) {
      bg = Colors.red.shade50;
      border = Colors.red.shade200;
      text = Colors.red.shade800;
      label = 'Mã OTP đã hết hạn';
    } else if (_secondsLeft <= 60) {
      bg = Colors.amber.shade50;
      border = Colors.amber.shade200;
      text = Colors.amber.shade900;
      label = 'Thời gian còn lại';
    } else {
      bg = AppColors.primary.withValues(alpha: 0.06);
      border = AppColors.primary.withValues(alpha: 0.2);
      text = AppColors.onSurface;
      label = 'Thời gian còn lại';
    }
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: border),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(Icons.schedule, size: 18, color: text),
              const SizedBox(width: 8),
              Text(label, style: TextStyle(fontWeight: FontWeight.w600, color: text, fontSize: 13)),
            ],
          ),
          Text(
            _formatCountdown(_secondsLeft),
            style: TextStyle(fontFamily: 'monospace', fontSize: 18, fontWeight: FontWeight.bold, color: text),
          ),
        ],
      ),
    );
  }
}
