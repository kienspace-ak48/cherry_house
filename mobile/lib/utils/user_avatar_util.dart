import 'package:flutter/material.dart';

const _avatarColors = <Color>[
  Color(0xFF1A73E8),
  Color(0xFFD93025),
  Color(0xFFF9AB00),
  Color(0xFF1E8E3E),
  Color(0xFF9334E6),
  Color(0xFFE8710A),
  Color(0xFF0B8043),
  Color(0xFFAB47BC),
  Color(0xFF00ACC1),
  Color(0xFF5C6BC0),
  Color(0xFF8E24AA),
  Color(0xFF546E7A),
  Color(0xFFE91E63),
  Color(0xFF3949AB),
  Color(0xFF00897B),
];

String avatarInitial(String fullName) {
  final parts = fullName.trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty).toList();
  final first = parts.isNotEmpty ? parts.first : '';
  if (first.isEmpty) return 'C';
  return first[0].toUpperCase();
}

Color avatarColor(String seed) {
  final s = seed.trim().toLowerCase();
  final source = s.isEmpty ? 'cherry house' : s;
  var hash = 0;
  for (final code in source.codeUnits) {
    hash = code + ((hash << 5) - hash);
  }
  return _avatarColors[hash.abs() % _avatarColors.length];
}

bool isPlaceholderAvatarUrl(String? avatarUrl) {
  final raw = (avatarUrl ?? '').trim();
  if (raw.isEmpty) return true;
  return raw == '/default-user-avatar.svg' || raw.endsWith('/default-user-avatar.svg');
}
