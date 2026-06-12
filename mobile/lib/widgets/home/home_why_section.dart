import 'package:flutter/material.dart';

import '../../models/home_content.dart';
import '../../theme/app_colors.dart';
import 'home_section_header.dart';

class HomeWhySection extends StatelessWidget {
  const HomeWhySection({
    super.key,
    required this.eyebrow,
    required this.title,
    required this.description,
    required this.items,
  });

  final String eyebrow;
  final String title;
  final String description;
  final List<HomeWhyItem> items;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) return const SizedBox.shrink();

    return Container(
      color: AppColors.surface,
      padding: const EdgeInsets.fromLTRB(20, 36, 20, 36),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          HomeSectionHeader(eyebrow: eyebrow, title: title, description: description),
          const SizedBox(height: 20),
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.black.withValues(alpha: 0.08)),
            ),
            child: Column(
              children: [
                for (var i = 0; i < items.length; i++) ...[
                  if (i > 0) Divider(height: 1, color: Colors.black.withValues(alpha: 0.08)),
                  Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          items[i].number,
                          style: Theme.of(context).textTheme.displaySmall?.copyWith(
                                color: AppColors.primary.withValues(alpha: 0.2),
                                fontWeight: FontWeight.w800,
                                height: 1,
                              ),
                        ),
                        const SizedBox(height: 8),
                        Text(items[i].title, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Text(items[i].description, style: const TextStyle(color: AppColors.onSurfaceVariant, height: 1.5)),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
