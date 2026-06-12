import 'api_client.dart';

class CatalogApi {
  CatalogApi(this._client);

  final ApiClient _client;

  Future<List<Map<String, dynamic>>> listProperties({
    String? province,
    String? kind,
  }) async {
    final query = <String, String>{'isActive': 'true'};
    if (province != null && province.isNotEmpty) query['province'] = province;
    if (kind != null && kind.isNotEmpty && kind != 'all') query['kind'] = kind;
    final json = await _client.get('/catalog/properties', query: query);
    final data = json['data'];
    if (data is List) {
      return data.whereType<Map<String, dynamic>>().toList();
    }
    return [];
  }

  Future<Map<String, dynamic>?> getPropertyBySlug(String slug) async {
    final json = await _client.get('/catalog/properties/slug/${Uri.encodeComponent(slug)}');
    return json['data'] as Map<String, dynamic>?;
  }

  Future<List<Map<String, dynamic>>> listBranchRooms(int branchDbId) async {
    final json = await _client.get('/catalog/branches/$branchDbId/rooms');
    final data = json['data'];
    if (data is List) {
      return data.whereType<Map<String, dynamic>>().toList();
    }
    return [];
  }
}
