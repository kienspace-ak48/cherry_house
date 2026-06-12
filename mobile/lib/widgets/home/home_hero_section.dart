import 'dart:async';

import 'package:flutter/material.dart';

import '../../models/home_content.dart';
import '../../models/models.dart';
import '../../theme/app_colors.dart';
import '../../utils/media_url.dart';
import '../booking_search_bar.dart';
import '../network_image.dart';

const _trustStats = [
  (icon: Icons.map_outlined, value: '10+', label: 'điểm đến'),
  (icon: Icons.verified_outlined, value: 'Đặt trực tiếp', label: 'không qua sàn'),
  (icon: Icons.support_agent_outlined, value: '24/7', label: 'hỗ trợ đặt phòng'),
];

class HomeHeroSection extends StatefulWidget {
  const HomeHeroSection({
    super.key,
    required this.config,
    required this.onSearch,
    required this.onQuickCity,
  });

  final HomeHeroConfig config;
  final ValueChanged<BookingSearch> onSearch;
  final ValueChanged<String> onQuickCity;

  @override
  State<HomeHeroSection> createState() => _HomeHeroSectionState();
}

class _HomeHeroSectionState extends State<HomeHeroSection> {
  int _index = 0;
  Timer? _timer;

  List<HomeHeroSlide> get _slides => widget.config.slides;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  @override
  void didUpdateWidget(HomeHeroSection oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.config.slideIntervalSec != widget.config.slideIntervalSec ||
        oldWidget.config.slides.length != widget.config.slides.length) {
      _index = 0;
      _restartTimer();
    }
  }

  void _startTimer() {
    _timer?.cancel();
    if (_slides.length <= 1) return;
    final sec = widget.config.slideIntervalSec.clamp(3, 30);
    _timer = Timer.periodic(Duration(seconds: sec), (_) {
      if (!mounted) return;
      setState(() => _index = (_index + 1) % _slides.length);
    });
  }

  void _restartTimer() {
    _timer?.cancel();
    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_slides.isEmpty) return const SizedBox.shrink();
    final slide = _slides[_index];
    final height = MediaQuery.sizeOf(context).height * 0.88;

    return SizedBox(
      height: height,
      child: Stack(
        fit: StackFit.expand,
        children: [
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 1400),
            child: AppNetworkImage(
              key: ValueKey(slide.imageUrl),
              url: resolveMediaUrl(slide.imageUrl),
            ),
          ),
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Color(0x661C1C19),
                  Color(0x991C1C19),
                  Color(0xCC1C1C19),
                ],
              ),
            ),
          ),
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
              child: Column(
                children: [
                  if (slide.badge.isNotEmpty)
                    Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.25)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.favorite, size: 16, color: AppColors.primaryContainer),
                          const SizedBox(width: 6),
                          Text(
                            slide.badge.toUpperCase(),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                  Text(
                    slide.titleLine1,
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w800,
                          height: 1.1,
                        ),
                  ),
                  if (slide.titleLine2.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 6),
                      child: Text(
                        slide.titleLine2,
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              color: Colors.white.withValues(alpha: 0.95),
                              fontStyle: FontStyle.italic,
                              fontWeight: FontWeight.w400,
                            ),
                      ),
                    ),
                  if (slide.description.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    Text(
                      slide.description,
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.white.withValues(alpha: 0.88), height: 1.5),
                    ),
                  ],
                  if (_slides.length > 1) ...[
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(_slides.length, (i) {
                        final active = i == _index;
                        return GestureDetector(
                          onTap: () => setState(() => _index = i),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 300),
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            width: active ? 28 : 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: active ? Colors.white : Colors.white.withValues(alpha: 0.45),
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                        );
                      }),
                    ),
                  ],
                  const SizedBox(height: 20),
                  BookingSearchBar(compact: true, onSearch: widget.onSearch),
                  const SizedBox(height: 14),
                  Wrap(
                    alignment: WrapAlignment.center,
                    spacing: 8,
                    runSpacing: 8,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      Text('Phổ biến:', style: TextStyle(fontSize: 12, color: Colors.white.withValues(alpha: 0.7))),
                      ...widget.config.quickCities.map(
                        (city) => ActionChip(
                          label: Text(city, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                          backgroundColor: Colors.white.withValues(alpha: 0.12),
                          side: BorderSide(color: Colors.white.withValues(alpha: 0.2)),
                          labelStyle: const TextStyle(color: Colors.white),
                          onPressed: () => widget.onQuickCity(city),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  ..._trustStats.map(
                    (s) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.22),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
                        ),
                        child: Row(
                          children: [
                            Icon(s.icon, color: AppColors.primaryContainer, size: 22),
                            const SizedBox(width: 10),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(s.value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                                Text(s.label, style: TextStyle(fontSize: 11, color: Colors.white.withValues(alpha: 0.75))),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
