import 'package:flutter/material.dart';

import '../models/models.dart';
import '../theme/app_colors.dart';
import '../utils/format.dart';
import '../widgets/network_image.dart';
import 'checkout_screen.dart';

class RoomDetailScreen extends StatelessWidget {
  const RoomDetailScreen({
    super.key,
    required this.property,
    required this.branch,
    required this.room,
    required this.search,
  });

  final Property property;
  final SubBranch branch;
  final Room room;
  final BookingSearch search;

  int get _nights {
    if (search.checkIn == null || search.checkOut == null) return 2;
    return search.checkOut!.difference(search.checkIn!).inDays.clamp(1, 30);
  }

  @override
  Widget build(BuildContext context) {
    final total = room.priceVnd * _nights;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 240,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(background: AppNetworkImage(url: room.imageUrl)),
          ),
          SliverPadding(
            padding: const EdgeInsets.all(16),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                Text(room.code, style: Theme.of(context).textTheme.headlineMedium),
                Text('${property.name} · ${branch.name}', style: Theme.of(context).textTheme.bodySmall),
                const SizedBox(height: 12),
                Text(room.description),
                const SizedBox(height: 16),
                _InfoRow(icon: Icons.category, label: 'Loại phòng', value: room.type),
                _InfoRow(icon: Icons.people, label: 'Sức chứa', value: room.capacityLabel),
                const SizedBox(height: 20),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.heroFilter,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.black.withValues(alpha: 0.05)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Tổng tạm tính ($_nights đêm)', style: Theme.of(context).textTheme.titleSmall),
                      const SizedBox(height: 8),
                      Text(
                        formatPriceVnd(total),
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(color: AppColors.primary),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${formatPriceVnd(room.priceVnd)} / đêm',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => CheckoutScreen(
                        property: property,
                        branch: branch,
                        room: room,
                        search: search,
                        nights: _nights,
                        totalVnd: total,
                      ),
                    ),
                  ),
                  child: const Text('Đặt phòng'),
                ),
                const SizedBox(height: 32),
              ]),
            ),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(formatPriceVnd(total), style: Theme.of(context).textTheme.titleMedium?.copyWith(color: AppColors.primary)),
                    Text('$_nights đêm', style: Theme.of(context).textTheme.bodySmall),
                  ],
                ),
              ),
              FilledButton(
                onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => CheckoutScreen(
                      property: property,
                      branch: branch,
                      room: room,
                      search: search,
                      nights: _nights,
                      totalVnd: total,
                    ),
                  ),
                ),
                child: const Text('Đặt phòng'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.icon, required this.label, required this.value});

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.primary),
          const SizedBox(width: 10),
          Text('$label: ', style: Theme.of(context).textTheme.bodySmall),
          Expanded(child: Text(value, style: Theme.of(context).textTheme.bodyMedium)),
        ],
      ),
    );
  }
}
