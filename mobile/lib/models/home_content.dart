class HomeHeroSlide {
  const HomeHeroSlide({
    required this.imageUrl,
    this.alt = '',
    this.badge = '',
    this.titleLine1 = '',
    this.titleLine2 = '',
    this.description = '',
  });

  final String imageUrl;
  final String alt;
  final String badge;
  final String titleLine1;
  final String titleLine2;
  final String description;

  factory HomeHeroSlide.fromJson(Map<String, dynamic> json) {
    return HomeHeroSlide(
      imageUrl: json['imageUrl'] as String? ?? '',
      alt: json['alt'] as String? ?? '',
      badge: json['badge'] as String? ?? '',
      titleLine1: json['titleLine1'] as String? ?? '',
      titleLine2: json['titleLine2'] as String? ?? '',
      description: json['description'] as String? ?? '',
    );
  }
}

class HomeHeroConfig {
  const HomeHeroConfig({
    required this.slides,
    required this.quickCities,
    this.slideIntervalSec = 6,
    this.isEnabled = true,
  });

  final List<HomeHeroSlide> slides;
  final List<String> quickCities;
  final int slideIntervalSec;
  final bool isEnabled;

  factory HomeHeroConfig.fromJson(Map<String, dynamic> json) {
    return HomeHeroConfig(
      slides: (json['slides'] as List<dynamic>? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(HomeHeroSlide.fromJson)
          .where((s) => s.imageUrl.isNotEmpty)
          .toList(),
      quickCities: (json['quickCities'] as List<dynamic>? ?? [])
          .map((e) => e.toString())
          .where((e) => e.isNotEmpty)
          .toList(),
      slideIntervalSec: (json['slideIntervalSec'] as num?)?.toInt() ?? 6,
      isEnabled: json['isEnabled'] as bool? ?? true,
    );
  }
}

class HomeStatItem {
  const HomeStatItem({required this.value, required this.label});
  final String value;
  final String label;

  factory HomeStatItem.fromJson(Map<String, dynamic> json) {
    return HomeStatItem(
      value: json['value'] as String? ?? '',
      label: json['label'] as String? ?? '',
    );
  }
}

class HomeWhyItem {
  const HomeWhyItem({required this.number, required this.title, required this.description});
  final String number;
  final String title;
  final String description;

  factory HomeWhyItem.fromJson(Map<String, dynamic> json) {
    return HomeWhyItem(
      number: json['number'] as String? ?? '',
      title: json['title'] as String? ?? '',
      description: json['description'] as String? ?? '',
    );
  }
}

class HomeAreaItem {
  const HomeAreaItem({
    required this.title,
    this.subtitle = '',
    this.imageUrl = '',
    this.priceFrom = '',
    this.filterCity = '',
    this.isFeatured = false,
    this.comingSoon = false,
  });

  final String title;
  final String subtitle;
  final String imageUrl;
  final String priceFrom;
  final String filterCity;
  final bool isFeatured;
  final bool comingSoon;

  factory HomeAreaItem.fromJson(Map<String, dynamic> json) {
    return HomeAreaItem(
      title: json['title'] as String? ?? '',
      subtitle: json['subtitle'] as String? ?? '',
      imageUrl: json['imageUrl'] as String? ?? '',
      priceFrom: json['priceFrom'] as String? ?? '',
      filterCity: json['filterCity'] as String? ?? json['title'] as String? ?? '',
      isFeatured: json['isFeatured'] as bool? ?? false,
      comingSoon: json['comingSoon'] as bool? ?? false,
    );
  }
}

class HomeKindItem {
  const HomeKindItem({
    required this.kind,
    this.badge = '',
    this.countLabel = '',
    this.imageUrl = '',
  });

  final String kind;
  final String badge;
  final String countLabel;
  final String imageUrl;

  factory HomeKindItem.fromJson(Map<String, dynamic> json) {
    return HomeKindItem(
      kind: json['kind'] as String? ?? '',
      badge: json['badge'] as String? ?? '',
      countLabel: json['countLabel'] as String? ?? '',
      imageUrl: json['imageUrl'] as String? ?? '',
    );
  }
}

class HomeReviewItem {
  const HomeReviewItem({
    required this.quote,
    required this.name,
    this.meta = '',
    this.initials = '',
    this.rating = 5,
  });

  final String quote;
  final String name;
  final String meta;
  final String initials;
  final int rating;

  factory HomeReviewItem.fromJson(Map<String, dynamic> json) {
    return HomeReviewItem(
      quote: json['quote'] as String? ?? '',
      name: json['name'] as String? ?? '',
      meta: json['meta'] as String? ?? '',
      initials: json['initials'] as String? ?? '',
      rating: (json['rating'] as num?)?.toInt() ?? 5,
    );
  }
}

class HomeSectionsConfig {
  const HomeSectionsConfig({
    this.statsEnabled = true,
    this.stats = const [],
    this.whyEnabled = true,
    this.whyEyebrow = '',
    this.whyTitle = '',
    this.whyDescription = '',
    this.whyItems = const [],
    this.areasEnabled = true,
    this.areasEyebrow = '',
    this.areasTitle = '',
    this.areasSeeAllLabel = 'Xem tất cả',
    this.areas = const [],
    this.kindsEnabled = true,
    this.kindsEyebrow = '',
    this.kindsTitle = '',
    this.kindsDescription = '',
    this.kinds = const [],
    this.reviewsEnabled = true,
    this.reviewsEyebrow = '',
    this.reviewsTitle = '',
    this.reviews = const [],
    this.newsletterEnabled = true,
    this.newsletterTitle = '',
    this.newsletterDescription = '',
    this.newsletterPlaceholder = 'Email của bạn',
    this.newsletterButtonLabel = 'Đăng ký ngay',
    this.newsletterSuccessMessage = '',
  });

  final bool statsEnabled;
  final List<HomeStatItem> stats;
  final bool whyEnabled;
  final String whyEyebrow;
  final String whyTitle;
  final String whyDescription;
  final List<HomeWhyItem> whyItems;
  final bool areasEnabled;
  final String areasEyebrow;
  final String areasTitle;
  final String areasSeeAllLabel;
  final List<HomeAreaItem> areas;
  final bool kindsEnabled;
  final String kindsEyebrow;
  final String kindsTitle;
  final String kindsDescription;
  final List<HomeKindItem> kinds;
  final bool reviewsEnabled;
  final String reviewsEyebrow;
  final String reviewsTitle;
  final List<HomeReviewItem> reviews;
  final bool newsletterEnabled;
  final String newsletterTitle;
  final String newsletterDescription;
  final String newsletterPlaceholder;
  final String newsletterButtonLabel;
  final String newsletterSuccessMessage;

  factory HomeSectionsConfig.fromJson(Map<String, dynamic> json) {
    List<T> mapList<T>(String key, T Function(Map<String, dynamic>) fn) {
      return (json[key] as List<dynamic>? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(fn)
          .toList();
    }

    return HomeSectionsConfig(
      statsEnabled: json['statsEnabled'] as bool? ?? true,
      stats: mapList('stats', HomeStatItem.fromJson),
      whyEnabled: json['whyEnabled'] as bool? ?? true,
      whyEyebrow: json['whyEyebrow'] as String? ?? '',
      whyTitle: json['whyTitle'] as String? ?? '',
      whyDescription: json['whyDescription'] as String? ?? '',
      whyItems: mapList('whyItems', HomeWhyItem.fromJson),
      areasEnabled: json['areasEnabled'] as bool? ?? true,
      areasEyebrow: json['areasEyebrow'] as String? ?? '',
      areasTitle: json['areasTitle'] as String? ?? '',
      areasSeeAllLabel: json['areasSeeAllLabel'] as String? ?? 'Xem tất cả',
      areas: mapList('areas', HomeAreaItem.fromJson),
      kindsEnabled: json['kindsEnabled'] as bool? ?? true,
      kindsEyebrow: json['kindsEyebrow'] as String? ?? '',
      kindsTitle: json['kindsTitle'] as String? ?? '',
      kindsDescription: json['kindsDescription'] as String? ?? '',
      kinds: mapList('kinds', HomeKindItem.fromJson),
      reviewsEnabled: json['reviewsEnabled'] as bool? ?? true,
      reviewsEyebrow: json['reviewsEyebrow'] as String? ?? '',
      reviewsTitle: json['reviewsTitle'] as String? ?? '',
      reviews: mapList('reviews', HomeReviewItem.fromJson),
      newsletterEnabled: json['newsletterEnabled'] as bool? ?? true,
      newsletterTitle: json['newsletterTitle'] as String? ?? '',
      newsletterDescription: json['newsletterDescription'] as String? ?? '',
      newsletterPlaceholder: json['newsletterPlaceholder'] as String? ?? 'Email của bạn',
      newsletterButtonLabel: json['newsletterButtonLabel'] as String? ?? 'Đăng ký ngay',
      newsletterSuccessMessage: json['newsletterSuccessMessage'] as String? ?? '',
    );
  }
}
