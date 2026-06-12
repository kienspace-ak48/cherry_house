import 'package:flutter/material.dart';

import '../utils/media_url.dart';
import '../utils/user_avatar_util.dart';

class ProfileAvatar extends StatelessWidget {
  const ProfileAvatar({
    super.key,
    required this.fullName,
    this.avatarUrl,
    this.email,
    this.radius = 32,
  });

  final String fullName;
  final String? avatarUrl;
  final String? email;
  final double radius;

  String get _seed {
    final name = fullName.trim();
    if (name.isNotEmpty) return name;
    return (email ?? '').trim();
  }

  Widget _initialsAvatar() {
    final seed = _seed.isEmpty ? 'Cherry House' : _seed;
    return CircleAvatar(
      radius: radius,
      backgroundColor: avatarColor(seed),
      child: Text(
        avatarInitial(fullName.isNotEmpty ? fullName : seed),
        style: TextStyle(
          fontSize: radius * 0.85,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (isPlaceholderAvatarUrl(avatarUrl)) return _initialsAvatar();

    final resolved = resolveMediaUrl(avatarUrl);
    if (resolved.isEmpty) return _initialsAvatar();

    final size = radius * 2;
    return ClipOval(
      child: Image.network(
        resolved,
        width: size,
        height: size,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => _initialsAvatar(),
      ),
    );
  }
}
