import 'package:flutter/material.dart';

import '../data/home_defaults.dart';
import '../data/home_repository.dart';
import '../models/home_content.dart';
import '../models/models.dart';
import '../theme/app_colors.dart';
import '../widgets/home/home_areas_section.dart';
import '../widgets/home/home_hero_section.dart';
import '../widgets/home/home_kinds_section.dart';
import '../widgets/home/home_newsletter_section.dart';
import '../widgets/home/home_reviews_section.dart';
import '../widgets/home/home_stats_section.dart';
import '../widgets/home/home_why_section.dart';
import 'booking_discovery_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, this.onSwitchToBooking});

  /// Chuyển sang tab Đặt phòng trong MainShell (nếu có).
  final void Function(BookingSearch search)? onSwitchToBooking;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _repo = HomeRepository();
  HomeHeroConfig _hero = HomeDefaults.hero;
  HomeSectionsConfig _sections = HomeDefaults.sections;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final results = await Future.wait([_repo.fetchHero(), _repo.fetchSections()]);
    if (!mounted) return;
    setState(() {
      _hero = results[0] as HomeHeroConfig;
      _sections = results[1] as HomeSectionsConfig;
      _loading = false;
    });
  }

  void _openBooking(BookingSearch search) {
    if (widget.onSwitchToBooking != null) {
      widget.onSwitchToBooking!(search);
      return;
    }
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => BookingDiscoveryScreen(initialSearch: search)),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const ColoredBox(
        color: AppColors.surface,
        child: Center(child: CircularProgressIndicator(color: AppColors.primary)),
      );
    }

    return ColoredBox(
      color: AppColors.surface,
      child: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _load,
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: HomeHeroSection(
                config: _hero,
                onSearch: _openBooking,
                onQuickCity: (city) => _openBooking(BookingSearch(city: city)),
              ),
            ),
            if (_sections.statsEnabled && _sections.stats.isNotEmpty)
              SliverToBoxAdapter(child: HomeStatsSection(stats: _sections.stats)),
            if (_sections.whyEnabled && _sections.whyItems.isNotEmpty)
              SliverToBoxAdapter(
                child: HomeWhySection(
                  eyebrow: _sections.whyEyebrow,
                  title: _sections.whyTitle,
                  description: _sections.whyDescription,
                  items: _sections.whyItems,
                ),
              ),
            if (_sections.areasEnabled && _sections.areas.isNotEmpty)
              SliverToBoxAdapter(
                child: HomeAreasSection(
                  eyebrow: _sections.areasEyebrow,
                  title: _sections.areasTitle,
                  seeAllLabel: _sections.areasSeeAllLabel,
                  areas: _sections.areas,
                  onAreaTap: (area) => _openBooking(BookingSearch(city: area.filterCity)),
                  onSeeAll: () => _openBooking(const BookingSearch()),
                ),
              ),
            if (_sections.kindsEnabled && _sections.kinds.isNotEmpty)
              SliverToBoxAdapter(
                child: HomeKindsSection(
                  eyebrow: _sections.kindsEyebrow,
                  title: _sections.kindsTitle,
                  description: _sections.kindsDescription,
                  items: _sections.kinds,
                  onKindTap: (kind) => _openBooking(BookingSearch(kind: kind)),
                ),
              ),
            if (_sections.reviewsEnabled && _sections.reviews.isNotEmpty)
              SliverToBoxAdapter(
                child: HomeReviewsSection(
                  eyebrow: _sections.reviewsEyebrow,
                  title: _sections.reviewsTitle,
                  items: _sections.reviews,
                ),
              ),
            if (_sections.newsletterEnabled)
              SliverToBoxAdapter(
                child: HomeNewsletterSection(
                  title: _sections.newsletterTitle,
                  description: _sections.newsletterDescription,
                  placeholder: _sections.newsletterPlaceholder,
                  buttonLabel: _sections.newsletterButtonLabel,
                  successMessage: _sections.newsletterSuccessMessage,
                ),
              ),
            const SliverToBoxAdapter(child: SizedBox(height: 24)),
          ],
        ),
      ),
    );
  }
}
