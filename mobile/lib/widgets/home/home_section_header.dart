import 'package:flutter/material.dart';

import '../../theme/app_colors.dart';

class HomeSectionHeader extends StatelessWidget {
  const HomeSectionHeader({
    super.key,
    required this.eyebrow,
    required this.title,
    this.description,
    this.trailing,
    this.lightText = false,
  });

  final String eyebrow;
  final String title;
  final String? description;
  final Widget? trailing;
  final bool lightText;

  @override
  Widget build(BuildContext context) {
    final titleColor = lightText ? Colors.white : AppColors.onSurface;
    final subColor = lightText ? Colors.white70 : AppColors.onSurfaceVariant;
    final eyebrowColor = lightText ? AppColors.primaryContainer : AppColors.primary;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (eyebrow.isNotEmpty)
                Text(
                  eyebrow,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2,
                    color: eyebrowColor,
                  ),
                ),
              if (eyebrow.isNotEmpty) const SizedBox(height: 6),
              Text(
                title,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w800,
                      color: titleColor,
                      height: 1.2,
                    ),
              ),
              if (description != null && description!.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(description!, style: TextStyle(fontSize: 14, height: 1.5, color: subColor)),
              ],
            ],
          ),
        ),
        if (trailing != null) trailing!,
      ],
    );
  }
}
