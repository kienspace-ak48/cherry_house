class AppUser {
  const AppUser({
    required this.id,
    required this.email,
    required this.fullName,
    this.phone,
    this.avatarUrl,
    this.authProvider = 'local',
    this.membershipTier = 'standard',
  });

  final int id;
  final String email;
  final String fullName;
  final String? phone;
  final String? avatarUrl;
  final String authProvider;
  final String membershipTier;

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: json['id'] as int,
      email: json['email'] as String? ?? '',
      fullName: json['fullName'] as String? ?? '',
      phone: json['phone'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      authProvider: json['authProvider'] as String? ?? 'local',
      membershipTier: json['membershipTier'] as String? ?? 'standard',
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'fullName': fullName,
        'phone': phone,
        'avatarUrl': avatarUrl,
        'authProvider': authProvider,
        'membershipTier': membershipTier,
      };

  String get membershipLabel {
    switch (membershipTier) {
      case 'gold':
        return 'Vàng';
      case 'diamond':
        return 'Kim cương';
      default:
        return 'Tiêu chuẩn';
    }
  }

  String get authLabel => authProvider == 'google' ? 'Google' : 'Email';
}

class AuthSession {
  const AuthSession({required this.token, required this.user});

  final String token;
  final AppUser user;
}
