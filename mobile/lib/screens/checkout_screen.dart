import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../api/api_client.dart';
import '../app_services.dart';
import '../auth/auth_controller.dart';
import '../data/catalog_mapper.dart';
import '../models/models.dart';
import '../theme/app_colors.dart';
import '../utils/format.dart';
import '../widgets/booking_progress.dart';
import 'checkout_result_screen.dart';
import 'payment_webview_screen.dart';

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
  final _promoCtrl = TextEditingController();

  String _paymentMethod = 'card';
  int? _walletBalance;
  Map<String, dynamic>? _pricing;
  Map<String, dynamic>? _appliedPromo;
  bool _loadingPricing = true;
  bool _submitting = false;
  String? _error;
  String? _promoError;

  @override
  void initState() {
    super.initState();
    final auth = context.read<AuthController>();
    final user = auth.user;
    _nameCtrl = TextEditingController(text: user?.fullName ?? '');
    _emailCtrl = TextEditingController(text: user?.email ?? '');
    _phoneCtrl = TextEditingController(text: user?.phone ?? '');
    _loadPricing();
    if (auth.isLoggedIn) _loadWallet();
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _noteCtrl.dispose();
    _promoCtrl.dispose();
    super.dispose();
  }

  String? get _checkIn =>
      widget.search.checkIn != null ? isoDate(widget.search.checkIn!) : null;
  String? get _checkOut =>
      widget.search.checkOut != null ? isoDate(widget.search.checkOut!) : null;

  int get _totalVnd => (_pricing?['totalVnd'] as num?)?.toInt() ?? widget.totalVnd;

  Future<void> _loadPricing() async {
    if (_checkIn == null || _checkOut == null) {
      setState(() {
        _loadingPricing = false;
        _error = 'Chọn ngày nhận/trả phòng trước khi thanh toán.';
      });
      return;
    }
    try {
      final data = await AppServices.I.bookingApi.checkAvailability(
        propertySlug: widget.property.slug,
        branchCode: widget.branch.id,
        detailSlug: widget.room.detailSlug.isNotEmpty
            ? widget.room.detailSlug
            : widget.room.code.toLowerCase(),
        checkIn: _checkIn!,
        checkOut: _checkOut!,
      );
      if (!mounted) return;
      setState(() {
        _pricing = data;
        _loadingPricing = false;
        _error = data['available'] == false ? (data['message'] as String? ?? 'Phòng không còn trống') : null;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loadingPricing = false;
      });
    }
  }

  Future<void> _loadWallet() async {
    try {
      final data = await AppServices.I.walletApi.getSummary();
      if (mounted) setState(() => _walletBalance = (data['balanceVnd'] as num?)?.toInt() ?? 0);
    } catch (_) {}
  }

  Future<void> _applyPromo() async {
    final code = _promoCtrl.text.trim();
    if (code.isEmpty) return;
    setState(() {
      _promoError = null;
    });
    try {
      final subtotal = (_pricing?['subtotalVnd'] as num?)?.toInt() ?? widget.totalVnd;
      final res = await AppServices.I.promoApi.validate(code, subtotal);
      if (!mounted) return;
      setState(() => _appliedPromo = res);
    } catch (e) {
      setState(() {
        _appliedPromo = null;
        _promoError = e.toString();
      });
    }
  }

  Future<void> _confirm() async {
    if (_submitting || _error != null) return;
    if (_checkIn == null || _checkOut == null) return;

    final auth = context.read<AuthController>();
    if (_paymentMethod == 'cherry_wallet' && !auth.isLoggedIn) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đăng nhập để thanh toán bằng ví Cherry House')),
      );
      return;
    }

    setState(() {
      _submitting = true;
      _error = null;
    });

    try {
      final result = await AppServices.I.checkoutApi.startPay({
        'propertySlug': widget.property.slug,
        'branchCode': widget.branch.id,
        'detailSlug': widget.room.detailSlug.isNotEmpty
            ? widget.room.detailSlug
            : widget.room.code.toLowerCase(),
        'checkIn': _checkIn,
        'checkOut': _checkOut,
        'guests': '2-adults-0-children',
        'guestName': _nameCtrl.text.trim(),
        'guestPhone': _phoneCtrl.text.trim(),
        'guestEmail': _emailCtrl.text.trim(),
        if (_noteCtrl.text.trim().isNotEmpty) 'specialNote': _noteCtrl.text.trim(),
        if (_appliedPromo?['code'] != null) 'promoCode': _appliedPromo!['code'],
        'paymentMethod': _paymentMethod,
      });

      if (!mounted) return;

      final action = result['action'] as String?;
      final bookingCode = result['bookingCode'] as String? ?? '';

      if (action == 'redirect' && result['redirectUrl'] != null) {
        final url = result['redirectUrl'] as String;
        await Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => PaymentWebViewScreen(
              initialUrl: url,
              bookingCode: bookingCode,
              provider: _paymentMethod == 'momo' ? 'momo' : 'vnpay',
            ),
          ),
        );
        if (!mounted) return;
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => CheckoutResultScreen(bookingCode: bookingCode)),
        );
        return;
      }

      if (action == 'confirmed') {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => CheckoutResultScreen(bookingCode: bookingCode)),
        );
        return;
      }

      throw ApiException('Không nhận được phản hồi thanh toán');
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();
    final walletOk = _walletBalance != null && _walletBalance! >= _totalVnd;

    return Scaffold(
      appBar: AppBar(title: const Text('Thanh toán')),
      body: _loadingPricing
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : ListView(
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
                        if (_checkIn != null) Text('$_checkIn → $_checkOut', style: Theme.of(context).textTheme.bodySmall),
                        const SizedBox(height: 8),
                        _priceRow('Tổng thanh toán', _totalVnd, bold: true),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _promoCtrl,
                  decoration: InputDecoration(
                    labelText: 'Mã giảm giá',
                    suffixIcon: IconButton(icon: const Icon(Icons.check), onPressed: _applyPromo),
                    errorText: _promoError,
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
                const SizedBox(height: 20),
                Text('Phương thức thanh toán', style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 8),
                RadioListTile<String>(
                  value: 'card',
                  groupValue: _paymentMethod,
                  onChanged: (v) => setState(() => _paymentMethod = v!),
                  title: const Text('Thẻ / VNPay'),
                ),
                RadioListTile<String>(
                  value: 'momo',
                  groupValue: _paymentMethod,
                  onChanged: (v) => setState(() => _paymentMethod = v!),
                  title: const Text('MoMo'),
                ),
                if (auth.isLoggedIn)
                  RadioListTile<String>(
                    value: 'cherry_wallet',
                    groupValue: _paymentMethod,
                    onChanged: walletOk ? (v) => setState(() => _paymentMethod = v!) : null,
                    title: Text('Ví Cherry House${_walletBalance != null ? ' · ${formatPriceVnd(_walletBalance!)}' : ''}'),
                    subtitle: !walletOk && _walletBalance != null
                        ? Text('Không đủ số dư (cần ${formatPriceVnd(_totalVnd)})', style: const TextStyle(color: Colors.red))
                        : null,
                  ),
                if (_error != null) ...[
                  const SizedBox(height: 12),
                  Text(_error!, style: const TextStyle(color: Colors.red)),
                ],
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: _submitting || _error != null ? null : _confirm,
                  child: _submitting
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('Thanh toán'),
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
            style: TextStyle(fontWeight: bold ? FontWeight.bold : FontWeight.w600, color: bold ? AppColors.primary : null),
          ),
        ],
      ),
    );
  }
}
