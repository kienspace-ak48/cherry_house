import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../auth/auth_controller.dart';
import '../../theme/app_colors.dart';
import '../../widgets/auth_shell.dart';
import 'login_screen.dart';
import 'register_email_screen.dart';

class RegisterScreen extends StatelessWidget {
  const RegisterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return AuthShell(
      title: 'Tạo tài khoản',
      subtitle: 'Chọn cách đăng ký để đặt phòng và theo dõi booking.',
      footer: TextButton(
        onPressed: () => Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const LoginScreen()),
        ),
        child: const Text('Đã có tài khoản? Đăng nhập'),
      ),
      child: Column(
        children: [
          _AuthOptionCard(
            icon: Icons.mail_outline,
            title: 'Đăng ký bằng Email',
            subtitle: 'Điền thông tin → nhận mã OTP qua email',
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const RegisterEmailScreen()),
            ),
          ),
          const SizedBox(height: 12),
          _AuthOptionCard(
            icon: Icons.g_mobiledata,
            title: 'Đăng ký bằng Google',
            subtitle: 'Một chạm — xác thực qua tài khoản Google',
            onTap: () => _googleSignIn(context),
          ),
        ],
      ),
    );
  }

  Future<void> _googleSignIn(BuildContext context) async {
    final auth = context.read<AuthController>();
    try {
      await auth.signInWithGoogle();
      if (context.mounted) Navigator.pop(context);
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
        );
      }
    }
  }
}

class _AuthOptionCard extends StatelessWidget {
  const _AuthOptionCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.outline.withValues(alpha: 0.25)),
          ),
          child: Row(
            children: [
              CircleAvatar(
                backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                child: Icon(icon, color: AppColors.primary),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Text(subtitle, style: Theme.of(context).textTheme.bodySmall),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right),
            ],
          ),
        ),
      ),
    );
  }
}
