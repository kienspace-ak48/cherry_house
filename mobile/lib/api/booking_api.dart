import 'api_client.dart';

class BookingApi {
  BookingApi(this._client);

  final ApiClient _client;

  Future<Map<String, dynamic>> checkAvailability({
    required String propertySlug,
    required String branchCode,
    required String detailSlug,
    required String checkIn,
    required String checkOut,
  }) async {
    final json = await _client.post('/bookings/check-availability', {
      'propertySlug': propertySlug,
      'branchCode': branchCode,
      'detailSlug': detailSlug,
      'checkIn': checkIn,
      'checkOut': checkOut,
    });
    return json['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getOccupancy({
    required String propertySlug,
    required String branchCode,
    String? from,
    String? to,
  }) async {
    final query = <String, String>{
      'propertySlug': propertySlug,
      'branchCode': branchCode,
    };
    if (from != null) query['from'] = from;
    if (to != null) query['to'] = to;
    final json = await _client.get('/bookings/occupancy', query: query);
    return json['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> listMine({
    int page = 1,
    int pageSize = 10,
    String filter = 'all',
  }) async {
    final json = await _client.get('/bookings/me', query: {
      'page': '$page',
      'pageSize': '$pageSize',
      'filter': filter,
    });
    return json['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> cancelPreview(int bookingId) async {
    final json = await _client.get('/bookings/$bookingId/cancel-preview');
    return json['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> cancel(int bookingId) async {
    final json = await _client.post('/bookings/$bookingId/cancel', {});
    return json['data'] as Map<String, dynamic>;
  }
}
