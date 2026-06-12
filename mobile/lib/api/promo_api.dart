import 'api_client.dart';

class PromoApi {
  PromoApi(this._client);

  final ApiClient _client;

  Future<Map<String, dynamic>?> validate(String code, int subtotalVnd) async {
    final json = await _client.post('/promo-codes/validate', {
      'code': code,
      'subtotalVnd': subtotalVnd,
    });
    return json['data'] as Map<String, dynamic>?;
  }
}
