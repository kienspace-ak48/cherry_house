import 'package:flutter/material.dart';

import '../../models/home_content.dart';
import '../../theme/app_colors.dart';

class HomeStatsSection extends StatelessWidget {
  const HomeStatsSection({super.key, required this.stats});

  final List<HomeStatItem> stats;

  @override
  Widget build(BuildContext context) {
    if (stats.isEmpty) return const SizedBox.shrink();

    return Container(
      color: const Color(0xFFF5F0EA),
      padding: const EdgeInsets.symmetric(vertical: 28, horizontal: 16),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 1.6,
        ),
        itemCount: stats.length,
        itemBuilder: (_, i) {
          final s = stats[i];
          return Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              border: Border(
                right: i % 2 == 0 ? BorderSide(color: Colors.black.withValues(alpha: 0.08)) : BorderSide.none,
                bottom: i < 2 ? BorderSide(color: Colors.black.withValues(alpha: 0.08)) : BorderSide.none,
              ),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  s.value,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w800,
                      ),
                ),
                const SizedBox(height: 6),
                Text(
                  s.label,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 12, color: AppColors.onSurfaceVariant, height: 1.3),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
