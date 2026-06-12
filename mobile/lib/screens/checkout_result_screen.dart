import 'dart:async';

import 'package:flutter/material.dart';

import '../app_services.dart';
import '../theme/app_colors.dart';
import '../utils/format.dart';

class CheckoutResultScreen extends StatefulWidget {
  const CheckoutResultScreen({super.key, required this.bookingCode});

  final String bookingCode;

  @override
  State<CheckoutResultScreen> createState() => _CheckoutResultScreenState();
}

class _CheckoutResultScreenState extends State<CheckoutResultScreen> {
  Map<String, dynamic>? _status;
  String? _error;
  Timer? _pollTimer;
  int _pollCount = 0;

  @override
  void initState() {
    super.initState();
    _load();
    _pollTimer = Timer.periodic(const Duration(seconds: 3), (_) {
      if (_pollCount >= 20) {
        _pollTimer?.cancel();
        return;
      }
      _pollCount += 1;
      if (_status?['paymentStatus'] != 'paid' && _status?['status'] != 'confirmed') {
        _load(silent: true);
      } else {
        _pollTimer?.cancel();
      }
    });
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }

  Future<void> _load({bool silent = false}) async {
    try {
      final data = await AppServices.I.checkoutApi.getStatus(widget.bookingCode);
      if (!mounted) return;
      setState(() {
        _status = data;
        _error = null;
      });
    } catch (e) {
      if (!silent && mounted) setState(() => _error = e.toString());
    }
  }

  bool get _paid =>
      _status?['paymentStatus'] == 'paid' || _status?['status'] == 'confirmed';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Kết quả đặt phòng')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Icon(
              _paid ? Icons.check_circle : Icons.hourglass_top,
              size: 72,
              color: _paid ? AppColors.roomAvailable : AppColors.roomPending,
            ),
            const SizedBox(height: 16),
            Text(
              _paid ? 'Đặt phòng thành công' : 'Đang xác nhận thanh toán…',
              style: Theme.of(context).textTheme.headlineSmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text('Mã: ${widget.bookingCode}', style: Theme.of(context).textTheme.titleMedium),
            if (_status != null) ...[
              const SizedBox(height: 16),
              if (_status!['propertyName'] != null)
                Text(_status!['propertyName'] as String, textAlign: TextAlign.center),
              if (_status!['totalVnd'] != null)
                Text(
                  formatPriceVnd((_status!['totalVnd'] as num).toInt()),
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(color: AppColors.primary),
                ),
              Text('Trạng thái: ${_status!['status'] ?? '—'}', style: Theme.of(context).textTheme.bodySmall),
            ],
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(_error!, style: const TextStyle(color: Colors.red)),
            ],
            const Spacer(),
            FilledButton(
              onPressed: () => Navigator.popUntil(context, (r) => r.isFirst),
              child: const Text('Về trang chủ'),
            ),
          ],
        ),
      ),
    );
  }
}
