import 'api_client.dart';

class HomeApi {
  HomeApi(this._client);

  final ApiClient _client;

  Future<Map<String, dynamic>> getHero() async {
    final json = await _client.get('/home/hero');
    return json['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getSections() async {
    final json = await _client.get('/home/sections');
    return json['data'] as Map<String, dynamic>;
  }
}
