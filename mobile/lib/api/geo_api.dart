import 'api_client.dart';

class GeoApi {
  GeoApi(this._client);

  final ApiClient _client;

  Future<List<String>> fetchCatalogCities() async {
    final data = await _client.getJson('/geo/catalog-cities');
    final list = data['data'];
    if (list is! List) return [];
    return list.map((e) => e.toString()).where((s) => s.isNotEmpty).toList();
  }

  Future<List<Map<String, dynamic>>> fetchProvinces() async {
    final data = await _client.getJson('/geo/provinces');
    final list = data['data'];
    if (list is! List) return [];
    return list.map((e) => Map<String, dynamic>.from(e as Map)).toList();
  }
}
