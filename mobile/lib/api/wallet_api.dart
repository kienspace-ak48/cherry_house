import 'api_client.dart';

class WalletApi {
  WalletApi(this._client);

  final ApiClient _client;

  Future<Map<String, dynamic>> getSummary() async {
    final json = await _client.get('/wallet');
    return json['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> listTransactions({int page = 1, int pageSize = 20}) async {
    final json = await _client.get('/wallet/transactions', query: {
      'page': '$page',
      'pageSize': '$pageSize',
    });
    return json['data'] as Map<String, dynamic>;
  }
}
