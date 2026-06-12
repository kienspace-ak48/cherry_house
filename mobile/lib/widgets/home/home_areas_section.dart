import 'package:flutter/material.dart';

import '../../models/home_content.dart';
import '../../theme/app_colors.dart';
import '../../utils/media_url.dart';
import '../network_image.dart';
import 'home_section_header.dart';

class HomeAreasSection extends StatelessWidget {
  const HomeAreasSection({
    super.key,
    required this.eyebrow,
    required this.title,
    required this.seeAllLabel,
    required this.areas,
    required this.onAreaTap,
    required this.onSeeAll,
  });

  final String eyebrow;
  final String title;
  final String seeAllLabel;
  final List<HomeAreaItem> areas;
  final void Function(HomeAreaItem area) onAreaTap;
  final VoidCallback onSeeAll;

  @override
  Widget build(BuildContext context) {
    if (areas.isEmpty) return const SizedBox.shrink();

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(20, 36, 20, 36),
      child: Column(
        children: [
          HomeSectionHeader(
            eyebrow: eyebrow,
            title: title,
            trailing: TextButton(onPressed: onSeeAll, child: Text('$seeAllLabel →')),
          ),
          const SizedBox(height: 16),
          ...areas.map((area) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: _AreaTile(area: area, onTap: onAreaTap),
              )),
        ],
      ),
    );
  }
}

class _AreaTile extends StatelessWidget {
  const _AreaTile({required this.area, required this.onTap});

  final HomeAreaItem area;
  final void Function(HomeAreaItem area) onTap;

  @override
  Widget build(BuildContext context) {
    final featured = area.isFeatured;
    return GestureDetector(
      onTap: area.comingSoon ? null : () => onTap(area),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: SizedBox(
          height: featured ? 220 : 180,
          child: Stack(
            fit: StackFit.expand,
            children: [
              AppNetworkImage(url: resolveMediaUrl(area.imageUrl)),
              Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.black.withValues(alpha: 0.1),
                      Colors.black.withValues(alpha: 0.35),
                      Colors.black.withValues(alpha: 0.85),
                    ],
                  ),
                ),
              ),
              if (area.priceFrom.isNotEmpty)
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      area.priceFrom.toUpperCase(),
                      style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              if (area.comingSoon)
                Positioned(
                  top: 8,
                  left: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.9),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text('SẮP MỞ', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold)),
                  ),
                ),
              Positioned(
                left: 12,
                right: 12,
                bottom: 12,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      area.title,
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: featured ? 22 : 18,
                      ),
                    ),
                    if (area.subtitle.isNotEmpty)
                      Text(area.subtitle, style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 12)),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
