import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../auth/auth_controller.dart';
import '../models/user.dart';
import '../theme/app_colors.dart';
import '../widgets/profile_avatar.dart';
import 'auth/login_screen.dart';
import 'auth/register_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthController>(
      builder: (context, auth, _) {
        if (auth.isBootstrapping) {
          return const Center(child: CircularProgressIndicator(color: AppColors.primary));
        }
        if (!auth.isLoggedIn) {
          return _GuestProfile(
            onLogin: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const LoginScreen()),
            ),
            onRegister: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const RegisterScreen()),
            ),
          );
        }
        return _LoggedInProfile(user: auth.user!, onLogout: auth.logout);
      },
    );
  }
}

class _GuestProfile extends StatelessWidget {
  const _GuestProfile({required this.onLogin, required this.onRegister});

  final VoidCallback onLogin;
  final VoidCallback onRegister;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                Icon(Icons.person_outline, size: 56, color: AppColors.primary.withValues(alpha: 0.7)),
                const SizedBox(height: 12),
                Text(
                  'Chàm mừng đến Cherry House',
                  style: Theme.of(context).textTheme.titleMedium,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  'Đăng nhập hoặc đăng ký để quản lý đặt phòng và thông tin cá nhân.',
                  style: Theme.of(context).textTheme.bodySmall,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 20),
                FilledButton(
                  onPressed: onLogin,
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    minimumSize: const Size.fromHeight(44),
                  ),
                  child: const Text('Đăng nhập'),
                ),
                const SizedBox(height: 10),
                OutlinedButton(
                  onPressed: onRegister,
                  style: OutlinedButton.styleFrom(minimumSize: const Size.fromHeight(44)),
                  child: const Text('Đăng ký'),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _LoggedInProfile extends StatelessWidget {
  const _LoggedInProfile({required this.user, required this.onLogout});

  final AppUser user;
  final Future<void> Function() onLogout;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                ProfileAvatar(
                  fullName: user.fullName,
                  avatarUrl: user.avatarUrl,
                  radius: 32,
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(user.fullName, style: Theme.of(context).textTheme.titleMedium),
                      Text(user.email, style: Theme.of(context).textTheme.bodySmall),
                      Text(
                        user.authLabel,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppColors.onSurfaceVariant,
                            ),
                      ),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.roomPending.withValues(alpha: 0.25),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          'Hạng ${user.membershipLabel}',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        if (user.phone != null && user.phone!.isNotEmpty) ...[
          const SizedBox(height: 8),
          Card(
            child: ListTile(
              leading: const Icon(Icons.phone_outlined, color: AppColors.primary),
              title: const Text('Điện thoại'),
              subtitle: Text(user.phone!),
            ),
          ),
        ],
        const SizedBox(height: 16),
        _tile(Icons.event_note, 'Đặt phòng của tôi', 'Sắp có'),
        _tile(Icons.favorite_border, 'Yêu thích', 'Sắp có'),
        _tile(Icons.notifications_outlined, 'Thông báo', ''),
        _tile(Icons.help_outline, 'Hỗ trợ', 'hotline@cherryhouse.vn'),
        const SizedBox(height: 24),
        OutlinedButton(
          onPressed: () async {
            await onLogout();
            if (context.mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Đã đăng xuất')),
              );
            }
          },
          child: const Text('Đăng xuất'),
        ),
      ],
    );
  }

  Widget _tile(IconData icon, String title, String subtitle) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon, color: AppColors.primary),
        title: Text(title),
        subtitle: subtitle.isEmpty ? null : Text(subtitle, style: const TextStyle(fontSize: 12)),
        trailing: const Icon(Icons.chevron_right),
        onTap: () {},
      ),
    );
  }
}
