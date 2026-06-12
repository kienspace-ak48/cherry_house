import 'package:flutter/material.dart';

import '../../constants/catalog_constants.dart';
import '../../models/home_content.dart';
import '../../theme/app_colors.dart';
import '../../utils/media_url.dart';
import '../network_image.dart';
import 'home_section_header.dart';

String kindLabel(String kind) => CatalogConstants.kindOptions[kind] ?? kind;

class HomeKindsSection extends StatelessWidget {
  const HomeKindsSection({
    super.key,
    required this.eyebrow,
    required this.title,
    required this.description,
    required this.items,
    required this.onKindTap,
  });

  final String eyebrow;
  final String title;
  final String description;
  final List<HomeKindItem> items;
  final void Function(String kind) onKindTap;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) return const SizedBox.shrink();

    return Container(
      color: const Color(0xFF1C1C19),
      padding: const EdgeInsets.fromLTRB(20, 36, 20, 36),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          HomeSectionHeader(
            eyebrow: eyebrow,
            title: title,
            description: description,
            lightText: true,
          ),
          const SizedBox(height: 20),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              childAspectRatio: 0.78,
            ),
            itemCount: items.length,
            itemBuilder: (_, i) {
              final item = items[i];
              final label = kindLabel(item.kind);
              return GestureDetector(
                onTap: () => onKindTap(item.kind),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      Opacity(
                        opacity: 0.85,
                        child: AppNetworkImage(url: resolveMediaUrl(item.imageUrl)),
                      ),
                      Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.black.withValues(alpha: 0.2),
                              Colors.black.withValues(alpha: 0.45),
                              Colors.black.withValues(alpha: 0.9),
                            ],
                          ),
                        ),
                      ),
                      if (item.badge.isNotEmpty)
                        Positioned(
                          top: 8,
                          left: 8,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              item.badge,
                              style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                      Positioned(
                        left: 12,
                        right: 12,
                        bottom: 12,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                            if (item.countLabel.isNotEmpty)
                              Text(item.countLabel, style: TextStyle(color: Colors.white.withValues(alpha: 0.75), fontSize: 11)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
