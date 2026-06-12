import 'package:flutter/material.dart';

import '../../models/home_content.dart';
import '../../theme/app_colors.dart';
import 'home_section_header.dart';

class HomeReviewsSection extends StatelessWidget {
  const HomeReviewsSection({
    super.key,
    required this.eyebrow,
    required this.title,
    required this.items,
  });

  final String eyebrow;
  final String title;
  final List<HomeReviewItem> items;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) return const SizedBox.shrink();

    return Container(
      color: const Color(0xFFFDF8F1),
      padding: const EdgeInsets.fromLTRB(0, 36, 0, 36),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: HomeSectionHeader(eyebrow: eyebrow, title: title),
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 240,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              scrollDirection: Axis.horizontal,
              itemCount: items.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (_, i) {
                final r = items[i];
                return Container(
                  width: 280,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.black.withValues(alpha: 0.05)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: List.generate(
                          5,
                          (s) => Icon(
                            s < r.rating ? Icons.star : Icons.star_border,
                            size: 16,
                            color: Colors.amber,
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                      Expanded(
                        child: Text(
                          '“${r.quote}”',
                          style: const TextStyle(height: 1.5, fontSize: 14),
                        ),
                      ),
                      const Divider(height: 20),
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 18,
                            backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                            child: Text(
                              r.initials.isNotEmpty ? r.initials : r.name.substring(0, 2).toUpperCase(),
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(r.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                if (r.meta.isNotEmpty)
                                  Text(r.meta, style: const TextStyle(fontSize: 11, color: AppColors.onSurfaceVariant)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
