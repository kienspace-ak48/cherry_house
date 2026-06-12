import '../app_services.dart';
import '../models/home_content.dart';
import 'home_defaults.dart';

class HomeRepository {
  Future<HomeHeroConfig> fetchHero() async {
    try {
      final data = await AppServices.I.homeApi.getHero();
      final config = HomeHeroConfig.fromJson(data);
      if (config.isEnabled && config.slides.isNotEmpty) return config;
    } catch (_) {}
    return HomeDefaults.hero;
  }

  Future<HomeSectionsConfig> fetchSections() async {
    try {
      final data = await AppServices.I.homeApi.getSections();
      return HomeSectionsConfig.fromJson(data);
    } catch (_) {}
    return HomeDefaults.sections;
  }
}
