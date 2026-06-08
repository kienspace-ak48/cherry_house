import 'package:flutter/material.dart';

import '../models/models.dart';
import '../theme/app_colors.dart';
import '../utils/format.dart';
import '../widgets/booking_progress.dart';
import '../widgets/network_image.dart';
import 'room_list_screen.dart';

class BranchSelectScreen extends StatelessWidget {
  const BranchSelectScreen({
    super.key,
    required this.property,
    required this.search,
  });

  final Property property;
  final BookingSearch search;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Chọn chi nhánh')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const BookingProgressBar(current: BookingStep.branch),
          const SizedBox(height: 8),
          Text(property.name, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 16),
          ...property.subBranches.map((b) => Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: InkWell(
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => RoomListScreen(property: property, branch: b, search: search),
                    ),
                  ),
                  child: Row(
                    children: [
                      ClipRRect(
                        borderRadius: const BorderRadius.horizontal(left: Radius.circular(16)),
                        child: SizedBox(
                          width: 110,
                          height: 110,
                          child: AppNetworkImage(url: b.imageUrl.isNotEmpty ? b.imageUrl : property.heroImageUrl),
                        ),
                      ),
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.all(14),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(b.name, style: Theme.of(context).textTheme.titleSmall),
                              const SizedBox(height: 4),
                              Text(b.address, style: Theme.of(context).textTheme.bodySmall),
                              if (b.tagline.isNotEmpty) ...[
                                const SizedBox(height: 4),
                                Text(b.tagline, style: Theme.of(context).textTheme.bodySmall),
                              ],
                              const SizedBox(height: 8),
                              Text(
                                formatPriceFrom(b.priceFromVnd),
                                style: const TextStyle(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const Padding(
                        padding: EdgeInsets.only(right: 12),
                        child: Icon(Icons.chevron_right),
                      ),
                    ],
                  ),
                ),
              )),
        ],
      ),
    );
  }
}
