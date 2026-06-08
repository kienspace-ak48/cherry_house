import 'package:flutter/material.dart';

import '../data/fake_data.dart';
import '../models/models.dart';
import '../theme/app_colors.dart';
import '../widgets/booking_search_bar.dart';
import '../widgets/network_image.dart';
import 'booking_discovery_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  void _openBooking(BuildContext context, BookingSearch search) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => BookingDiscoveryScreen(initialSearch: search),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.home_work, color: Colors.white, size: 20),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    'Cherry House',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(color: AppColors.primary),
                  ),
                ],
              ),
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: SizedBox(
            height: MediaQuery.sizeOf(context).height * 0.62,
            child: Stack(
              fit: StackFit.expand,
              children: [
                const AppNetworkImage(url: FakeData.heroImage),
                Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Color(0x661C1C19), Color(0xB31C1C19)],
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'Homestay & Mini Stay',
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.displaySmall?.copyWith(
                              color: Colors.white,
                              height: 1.15,
                            ),
                      ),
                      Text(
                        'Trên khắp Việt Nam',
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                              color: Colors.white.withValues(alpha: 0.9),
                              fontStyle: FontStyle.italic,
                              fontWeight: FontWeight.w400,
                            ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Website chính thức Cherry House — đặt trực tiếp, không qua sàn trung gian.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.white.withValues(alpha: 0.9), fontSize: 14),
                      ),
                      const SizedBox(height: 20),
                      BookingSearchBar(
                        compact: true,
                        onSearch: (s) => _openBooking(context, s),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.all(20),
          sliver: SliverList(
            delegate: SliverChildListDelegate([
              Text('Khu vực phổ biến', style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: 8),
              Text(
                'Chọn khu vực để xem cơ sở và chi nhánh.',
                style: Theme.of(context).textTheme.bodySmall,
              ),
              const SizedBox(height: 16),
              SizedBox(
                height: 220,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: FakeData.popularAreas.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 12),
                  itemBuilder: (context, i) {
                    final area = FakeData.popularAreas[i];
                    return _AreaCard(
                      area: area,
                      onTap: area.comingSoon
                          ? null
                          : () => _openBooking(context, BookingSearch(city: area.city)),
                    );
                  },
                ),
              ),
              const SizedBox(height: 28),
              Text('Loại hình lưu trú', style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: 12),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: [
                  _KindChip(label: 'Homestay', onTap: () => _openBooking(context, const BookingSearch(kind: 'homestay'))),
                  _KindChip(label: 'Mini Hotel', onTap: () => _openBooking(context, const BookingSearch(kind: 'mini_hotel'))),
                  _KindChip(label: 'Villa', onTap: () => _openBooking(context, const BookingSearch(kind: 'villa'))),
                  _KindChip(label: 'Căn hộ DV', onTap: () => _openBooking(context, const BookingSearch(kind: 'serviced_apartment'))),
                ],
              ),
              const SizedBox(height: 32),
            ]),
          ),
        ),
      ],
    );
  }
}

class _AreaCard extends StatelessWidget {
  const _AreaCard({required this.area, this.onTap});

  final PopularArea area;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: 160,
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Stack(
            fit: StackFit.expand,
            children: [
              AppNetworkImage(url: area.imageUrl),
              Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [Colors.transparent, Colors.black.withValues(alpha: 0.65)],
                  ),
                ),
              ),
              if (area.comingSoon)
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.roomPending,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text('Sắp có', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white)),
                  ),
                ),
              Positioned(
                left: 12,
                right: 12,
                bottom: 12,
                child: Text(
                  area.label,
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _KindChip extends StatelessWidget {
  const _KindChip({required this.label, required this.onTap});

  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ActionChip(
      label: Text(label),
      onPressed: onTap,
      backgroundColor: Colors.white,
      side: BorderSide(color: Colors.black.withValues(alpha: 0.08)),
    );
  }
}
