import 'package:flutter/material.dart';

import '../app_services.dart';
import '../models/models.dart';
import '../theme/app_colors.dart';
import '../utils/format.dart';
import '../widgets/booking_progress.dart';
import '../widgets/network_image.dart';
import 'branch_select_screen.dart';
import 'room_list_screen.dart';

class PropertyDetailScreen extends StatefulWidget {
  const PropertyDetailScreen({super.key, required this.property, required this.search});

  final Property property;
  final BookingSearch search;

  @override
  State<PropertyDetailScreen> createState() => _PropertyDetailScreenState();
}

class _PropertyDetailScreenState extends State<PropertyDetailScreen> {
  Property? _detail;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final d = await AppServices.I.fetchPropertyDetail(widget.property.slug);
      if (mounted) setState(() {
        _detail = d ?? widget.property;
        _loading = false;
      });
    } catch (_) {
      if (mounted) setState(() {
        _detail = widget.property;
        _loading = false;
      });
    }
  }

  Property get property => _detail ?? widget.property;

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator(color: AppColors.primary)));
    }

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 260,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: AppNetworkImage(url: property.heroImageUrl),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.all(16),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                const BookingProgressBar(current: BookingStep.property),
                const SizedBox(height: 16),
                Text(property.name, style: Theme.of(context).textTheme.headlineMedium),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.star, color: Colors.amber, size: 18),
                    Text(' ${property.rating} (${property.reviewCount} đánh giá)'),
                  ],
                ),
                const SizedBox(height: 8),
                Text('${property.city}, ${property.region}', style: Theme.of(context).textTheme.bodySmall),
                const SizedBox(height: 12),
                Text(property.description),
                if (property.amenities.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  Text('Tiện nghi', style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: property.amenities
                        .map((a) => Chip(
                              avatar: Icon(a.icon, size: 16, color: AppColors.primary),
                              label: Text(a.label, style: const TextStyle(fontSize: 12)),
                            ))
                        .toList(),
                  ),
                ],
                if (property.gallery.length > 1) ...[
                  const SizedBox(height: 20),
                  Text('Hình ảnh', style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 8),
                  SizedBox(
                    height: 100,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: property.gallery.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 8),
                      itemBuilder: (_, i) => ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: SizedBox(width: 140, child: AppNetworkImage(url: property.gallery[i])),
                      ),
                    ),
                  ),
                ],
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: () {
                    if (property.subBranches.length == 1) {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => RoomListScreen(
                            property: property,
                            branch: property.subBranches.first,
                            search: widget.search,
                          ),
                        ),
                      );
                    } else {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => BranchSelectScreen(property: property, search: widget.search),
                        ),
                      );
                    }
                  },
                  child: Text(
                    property.subBranches.length == 1
                        ? 'Xem phòng trống'
                        : 'Chọn chi nhánh (${property.branchCount})',
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  formatPriceFrom(property.priceFromVnd),
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(color: AppColors.primary),
                ),
                const SizedBox(height: 32),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}
