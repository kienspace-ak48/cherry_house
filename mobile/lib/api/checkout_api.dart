import 'api_client.dart';

class CheckoutApi {
  CheckoutApi(this._client);

  final ApiClient _client;

  Future<Map<String, dynamic>> startPay(Map<String, dynamic> payload) async {
    final json = await _client.post('/checkout/pay', payload);
    return json['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getStatus(String bookingCode) async {
    final json = await _client.get('/checkout/status/${Uri.encodeComponent(bookingCode)}');
    return json['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> verifyVnpay(Map<String, String> query) async {
    final json = await _client.get('/checkout/verify/vnpay', query: query);
    return json['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> verifyMomo(Map<String, String> query) async {
    final json = await _client.get('/checkout/verify/momo', query: query);
    return json['data'] as Map<String, dynamic>;
  }
}
