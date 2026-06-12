import 'package:flutter/material.dart';

import '../app_services.dart';
import '../models/models.dart';
import '../theme/app_colors.dart';
import '../utils/format.dart';
import '../widgets/booking_progress.dart';
import '../widgets/network_image.dart';
import 'room_detail_screen.dart';

class RoomListScreen extends StatefulWidget {
  const RoomListScreen({
    super.key,
    required this.property,
    required this.branch,
    required this.search,
  });

  final Property property;
  final SubBranch branch;
  final BookingSearch search;

  @override
  State<RoomListScreen> createState() => _RoomListScreenState();
}

class _RoomListScreenState extends State<RoomListScreen> {
  String _statusFilter = 'all';
  List<Room> _rooms = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final rooms = await AppServices.I.fetchRoomsWithOccupancy(
        property: widget.property,
        branch: widget.branch,
        search: widget.search,
      );
      if (!mounted) return;
      setState(() {
        _rooms = rooms;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  Color _statusColor(RoomStatus s) => switch (s) {
        RoomStatus.available => AppColors.roomAvailable,
        RoomStatus.pending => AppColors.roomPending,
        RoomStatus.booked => AppColors.roomBooked,
      };

  String _statusLabel(RoomStatus s) => switch (s) {
        RoomStatus.available => 'Sẵn sàng',
        RoomStatus.pending => 'Đang chờ',
        RoomStatus.booked => 'Đã đặt',
      };

  @override
  Widget build(BuildContext context) {
    final filtered = _rooms.where((r) {
      if (_statusFilter == 'available') return r.status == RoomStatus.available;
      if (_statusFilter == 'booked') return r.status == RoomStatus.booked;
      return true;
    }).toList();

    return Scaffold(
      appBar: AppBar(title: Text('Phòng · ${widget.branch.name}')),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(_error!, textAlign: TextAlign.center),
                      const SizedBox(height: 12),
                      FilledButton(onPressed: _load, child: const Text('Thử lại')),
                    ],
                  ),
                )
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    const BookingProgressBar(current: BookingStep.rooms),
                    const SizedBox(height: 12),
                    SegmentedButton<String>(
                      segments: const [
                        ButtonSegment(value: 'all', label: Text('Tất cả')),
                        ButtonSegment(value: 'available', label: Text('Trống')),
                        ButtonSegment(value: 'booked', label: Text('Đã đặt')),
                      ],
                      selected: {_statusFilter},
                      onSelectionChanged: (s) => setState(() => _statusFilter = s.first),
                    ),
                    const SizedBox(height: 16),
                    if (filtered.isEmpty)
                      const Center(child: Padding(padding: EdgeInsets.all(32), child: Text('Không có phòng phù hợp')))
                    else
                      ...filtered.map((room) => Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: InkWell(
                              onTap: room.status == RoomStatus.available
                                  ? () => Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (_) => RoomDetailScreen(
                                            property: widget.property,
                                            branch: widget.branch,
                                            room: room,
                                            search: widget.search,
                                          ),
                                        ),
                                      )
                                  : null,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  Stack(
                                    children: [
                                      AspectRatio(
                                        aspectRatio: 16 / 10,
                                        child: AppNetworkImage(url: room.imageUrl),
                                      ),
                                      Positioned(
                                        top: 10,
                                        right: 10,
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: _statusColor(room.status),
                                            borderRadius: BorderRadius.circular(20),
                                          ),
                                          child: Text(
                                            _statusLabel(room.status),
                                            style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  Padding(
                                    padding: const EdgeInsets.all(14),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(room.code, style: Theme.of(context).textTheme.titleMedium),
                                        Text(room.type, style: Theme.of(context).textTheme.bodySmall),
                                        const SizedBox(height: 6),
                                        Text(room.description, maxLines: 2, overflow: TextOverflow.ellipsis),
                                        const SizedBox(height: 10),
                                        Text(
                                          formatPriceVnd(room.priceVnd),
                                          style: Theme.of(context).textTheme.titleSmall?.copyWith(color: AppColors.primary),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          )),
                  ],
                ),
    );
  }
}
