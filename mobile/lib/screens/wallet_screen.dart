import 'package:flutter/material.dart';

import '../app_services.dart';
import '../theme/app_colors.dart';
import '../utils/format.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  int _balance = 0;
  List<Map<String, dynamic>> _tx = [];
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
      final summary = await AppServices.I.walletApi.getSummary();
      if (!mounted) return;
      setState(() {
        _balance = (summary['balanceVnd'] as num?)?.toInt() ?? 0;
        _tx = (summary['recentTransactions'] as List<dynamic>? ?? [])
            .whereType<Map<String, dynamic>>()
            .toList();
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

  String _txLabel(String? type) => switch (type) {
        'refund' => 'Hoàn tiền hủy phòng',
        'pay_booking' => 'Thanh toán đặt phòng',
        'admin_adjust' => 'Điều chỉnh admin',
        _ => type ?? '—',
      };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Ví Cherry House')),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _error != null
              ? Center(child: Text(_error!))
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    Card(
                      color: AppColors.primary.withValues(alpha: 0.08),
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Số dư', style: Theme.of(context).textTheme.bodySmall),
                            Text(
                              formatPriceVnd(_balance),
                              style: Theme.of(context).textTheme.headlineMedium?.copyWith(color: AppColors.primary),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    const Text('Hoàn 100% vào ví khi hủy trước 24h nhận phòng (14:00).'),
                    const SizedBox(height: 16),
                    Text('Lịch sử', style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 8),
                    if (_tx.isEmpty)
                      const Padding(padding: EdgeInsets.all(24), child: Center(child: Text('Chưa có giao dịch')))
                    else
                      ..._tx.map((t) => ListTile(
                            title: Text(_txLabel(t['type'] as String?)),
                            subtitle: Text(t['createdAt']?.toString() ?? ''),
                            trailing: Text(
                              () {
                                final amount = (t['amountVnd'] as num?)?.toInt() ?? 0;
                                return '${amount >= 0 ? '+' : ''}${formatPriceVnd(amount)}';
                              }(),
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: ((t['amountVnd'] as num?)?.toInt() ?? 0) >= 0 ? AppColors.primary : Colors.red,
                              ),
                            ),
                          )),
                  ],
                ),
    );
  }
}
