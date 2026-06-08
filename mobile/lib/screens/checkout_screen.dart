import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../auth/auth_controller.dart';
import '../data/fake_data.dart';
import '../models/models.dart';
import '../theme/app_colors.dart';
import '../utils/format.dart';
import '../widgets/booking_progress.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({
    super.key,
    required this.property,
    required this.branch,
    required this.room,
    required this.search,
    required this.nights,
    required this.totalVnd,
  });

  final Property property;
  final SubBranch branch;
  final Room room;
  final BookingSearch search;
  final int nights;
  final int totalVnd;

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  late final TextEditingController _nameCtrl;
  late final TextEditingController _emailCtrl;
  late final TextEditingController _phoneCtrl;
  final _noteCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    final auth = context.read<AuthController>();
    final user = auth.user;
    _nameCtrl = TextEditingController(text: user?.fullName ?? FakeData.fakeUser.name);
    _emailCtrl = TextEditingController(text: user?.email ?? FakeData.fakeUser.email);
    _phoneCtrl = TextEditingController(text: user?.phone ?? '');
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _noteCtrl.dispose();
    super.dispose();
  }

  void _confirm() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Đặt phòng thành công (demo)'),
        content: Text(
          'Mã booking: CH-${DateTime.now().millisecondsSinceEpoch % 100000}\n'
          '${widget.property.name}\n'
          'Phòng ${widget.room.code}',
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              Navigator.of(context).popUntil((r) => r.isFirst);
            },
            child: const Text('Về trang chủ'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final serviceFee = (widget.totalVnd * 0.05).round();

    return Scaffold(
      appBar: AppBar(title: const Text('Thanh toán')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const BookingProgressBar(current: BookingStep.checkout),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(widget.property.name, style: Theme.of(context).textTheme.titleMedium),
                  Text(widget.branch.name, style: Theme.of(context).textTheme.bodySmall),
                  const Divider(height: 20),
                  Text('Phòng ${widget.room.code} · ${widget.nights} đêm'),
                  const SizedBox(height: 8),
                  _priceRow('Giá phòng', widget.totalVnd),
                  _priceRow('Phí dịch vụ', serviceFee),
                  const Divider(),
                  _priceRow('Tổng cộng', widget.totalVnd + serviceFee, bold: true),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          Text('Thông tin khách', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 12),
          TextField(controller: _nameCtrl, decoration: const InputDecoration(labelText: 'Họ tên')),
          const SizedBox(height: 10),
          TextField(controller: _emailCtrl, decoration: const InputDecoration(labelText: 'Email'), keyboardType: TextInputType.emailAddress),
          const SizedBox(height: 10),
          TextField(controller: _phoneCtrl, decoration: const InputDecoration(labelText: 'Số điện thoại'), keyboardType: TextInputType.phone),
          const SizedBox(height: 10),
          TextField(controller: _noteCtrl, decoration: const InputDecoration(labelText: 'Ghi chú'), maxLines: 3),
          const SizedBox(height: 24),
          FilledButton(onPressed: _confirm, child: const Text('Xác nhận đặt phòng')),
          const SizedBox(height: 8),
          Center(
            child: Text(
              'UI demo — chưa kết nối API thanh toán',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ),
        ],
      ),
    );
  }

  Widget _priceRow(String label, int amount, {bool bold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontWeight: bold ? FontWeight.bold : FontWeight.normal)),
          Text(
            formatPriceVnd(amount),
            style: TextStyle(
              fontWeight: bold ? FontWeight.bold : FontWeight.w600,
              color: bold ? AppColors.primary : null,
            ),
          ),
        ],
      ),
    );
  }
}
