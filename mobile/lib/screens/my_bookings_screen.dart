import 'package:flutter/material.dart';

import '../app_services.dart';
import '../theme/app_colors.dart';
import '../utils/format.dart';

class MyBookingsScreen extends StatefulWidget {
  const MyBookingsScreen({super.key});

  @override
  State<MyBookingsScreen> createState() => _MyBookingsScreenState();
}

class _MyBookingsScreenState extends State<MyBookingsScreen> {
  List<Map<String, dynamic>> _items = [];
  bool _loading = true;
  String? _error;
  String _filter = 'all';

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
      final data = await AppServices.I.bookingApi.listMine(filter: _filter);
      if (!mounted) return;
      setState(() {
        _items = (data['items'] as List<dynamic>? ?? []).whereType<Map<String, dynamic>>().toList();
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

  Future<void> _cancelBooking(Map<String, dynamic> booking) async {
    final id = booking['id'] as int?;
    if (id == null) return;

    Map<String, dynamic>? preview;
    try {
      preview = await AppServices.I.bookingApi.cancelPreview(id);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      return;
    }

    final policy = preview['policy'] as Map<String, dynamic>?;
    if (!mounted) return;
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hủy đặt phòng'),
        content: Text(policy?['message'] as String? ?? 'Xác nhận hủy booking này?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Đóng')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Hủy đặt phòng')),
        ],
      ),
    );
    if (ok != true) return;

    try {
      await AppServices.I.bookingApi.cancel(id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Đã hủy đặt phòng')));
      _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Đặt phòng của tôi')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: SegmentedButton<String>(
              segments: const [
                ButtonSegment(value: 'all', label: Text('Tất cả')),
                ButtonSegment(value: 'upcoming', label: Text('Sắp tới')),
                ButtonSegment(value: 'past', label: Text('Đã qua')),
              ],
              selected: {_filter},
              onSelectionChanged: (s) {
                setState(() => _filter = s.first);
                _load();
              },
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                : _error != null
                    ? Center(child: Text(_error!))
                    : _items.isEmpty
                        ? const Center(child: Text('Chưa có đặt phòng'))
                        : ListView.separated(
                            padding: const EdgeInsets.all(16),
                            itemCount: _items.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 10),
                            itemBuilder: (_, i) {
                              final b = _items[i];
                              final status = b['status'] as String? ?? '';
                              final canCancel = status == 'confirmed' || status == 'pending_payment';
                              return Card(
                                child: Padding(
                                  padding: const EdgeInsets.all(14),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(b['propertyName'] as String? ?? '', style: Theme.of(context).textTheme.titleSmall),
                                      Text('${b['bookingCode']} · ${b['roomCode']}', style: Theme.of(context).textTheme.bodySmall),
                                      Text('${b['checkIn']} – ${b['checkOut']}', style: Theme.of(context).textTheme.bodySmall),
                                      const SizedBox(height: 6),
                                      Text(formatPriceVnd((b['totalVnd'] as num?)?.toInt() ?? 0), style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
                                      if (canCancel) ...[
                                        const SizedBox(height: 8),
                                        OutlinedButton(
                                          onPressed: () => _cancelBooking(b),
                                          child: const Text('Hủy đặt phòng'),
                                        ),
                                      ],
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
          ),
        ],
      ),
    );
  }
}
