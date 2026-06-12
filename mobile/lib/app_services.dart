import 'api/api_client.dart';
import 'api/auth_api.dart';
import 'api/booking_api.dart';
import 'api/catalog_api.dart';
import 'api/checkout_api.dart';
import 'api/home_api.dart';
import 'api/promo_api.dart';
import 'api/wallet_api.dart';
import 'data/catalog_mapper.dart';
import 'models/models.dart';

class AppServices {
  AppServices._();
  static final AppServices I = AppServices._();

  final apiClient = ApiClient();
  late final authApi = AuthApi(apiClient);
  late final catalogApi = CatalogApi(apiClient);
  late final bookingApi = BookingApi(apiClient);
  late final checkoutApi = CheckoutApi(apiClient);
  late final walletApi = WalletApi(apiClient);
  late final promoApi = PromoApi(apiClient);
  late final homeApi = HomeApi(apiClient);

  Future<List<Property>> fetchProperties(BookingSearch search) async {
    final rows = await catalogApi.listProperties(
      city: search.city.isNotEmpty ? search.city : null,
      kind: search.kind,
    );
    final mapped = rows.map(propertyFromApi).toList();
    return filterProperties(mapped, search);
  }

  Future<Property?> fetchPropertyDetail(String slug) async {
    final row = await catalogApi.getPropertyBySlug(slug);
    if (row == null) return null;
    return propertyFromApi(row);
  }

  Future<List<Room>> fetchRoomsWithOccupancy({
    required Property property,
    required SubBranch branch,
    required BookingSearch search,
  }) async {
    final branchDbId = branch.dbId;
    if (branchDbId == null) return [];

    final roomRows = await catalogApi.listBranchRooms(branchDbId);
    Map<String, String> occupancyByRoomId = {};

    if (search.checkIn != null && search.checkOut != null) {
      try {
        final occ = await bookingApi.getOccupancy(
          propertySlug: property.slug,
          branchCode: branch.id,
          from: isoDate(search.checkIn!),
          to: isoDate(search.checkOut!),
        );
        final rooms = occ['rooms'] as List<dynamic>? ?? [];
        for (final r in rooms) {
          if (r is Map<String, dynamic>) {
            final id = '${r['roomId'] ?? r['id']}';
            occupancyByRoomId[id] = r['occupancy'] as String? ?? 'available';
          }
        }
      } catch (_) {}
    }

    return roomRows.map((row) {
      final id = '${row['id']}';
      return roomFromApi(
        row,
        propertySlug: property.slug,
        branchCode: branch.id,
        branchDbId: branchDbId,
        occupancy: occupancyByRoomId[id],
      );
    }).toList();
  }
}
