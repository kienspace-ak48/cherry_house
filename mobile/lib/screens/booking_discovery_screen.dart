import 'package:flutter/material.dart';

import '../app_services.dart';
import '../config/app_config.dart';
import '../models/models.dart';
import '../theme/app_colors.dart';
import '../widgets/booking_progress.dart';
import '../widgets/booking_search_bar.dart';
import '../widgets/property_card.dart';
import 'property_detail_screen.dart';

class BookingDiscoveryScreen extends StatefulWidget {
  const BookingDiscoveryScreen({super.key, this.initialSearch, this.embeddedInShell = false});

  final BookingSearch? initialSearch;
  final bool embeddedInShell;

  @override
  State<BookingDiscoveryScreen> createState() => _BookingDiscoveryScreenState();
}

class _BookingDiscoveryScreenState extends State<BookingDiscoveryScreen> {
  late BookingSearch _search;
  List<Property> _list = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _search = widget.initialSearch ?? const BookingSearch();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final items = await AppServices.I.fetchProperties(_search);
      if (!mounted) return;
      setState(() {
        _list = items;
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

  void _applySearch(BookingSearch s) {
    setState(() => _search = s);
    _load();
  }

  @override
  Widget build(BuildContext context) {
    final summary = [
      if (_search.city.isNotEmpty) _search.city,
      if (_search.kind != 'all') _search.kind,
    ].where((e) => e.isNotEmpty).join(' · ');

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: widget.embeddedInShell
          ? AppBar(title: const Text('Đặt phòng'), automaticallyImplyLeading: false)
          : AppBar(
              title: const Text('Đặt phòng'),
              leading: Navigator.of(context).canPop()
                  ? IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => Navigator.pop(context))
                  : null,
            ),
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: const BookingProgressBar(current: BookingStep.property),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: BookingSearchBar(initial: _search, compact: true, onSearch: _applySearch),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Icon(Icons.cloud_done, size: 16, color: AppColors.roomAvailable),
                  const SizedBox(width: 6),
                  Text(
                    AppConfig.isProduction ? 'Dữ liệu trực tuyến' : 'API · ${AppConfig.envLabel}',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.roomAvailable),
                  ),
                ],
              ),
            ),
          ),
          if (_loading)
            const SliverFillRemaining(
              child: Center(child: CircularProgressIndicator(color: AppColors.primary)),
            )
          else if (_error != null)
            SliverFillRemaining(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(_error!, textAlign: TextAlign.center),
                      const SizedBox(height: 12),
                      FilledButton(onPressed: _load, child: const Text('Thử lại')),
                    ],
                  ),
                ),
              ),
            )
          else ...[
            if (summary.isNotEmpty)
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                  child: Text(
                    '$summary · ${_list.length} cơ sở phù hợp',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                  ),
                ),
              ),
            if (_list.isEmpty)
              SliverFillRemaining(
                hasScrollBody: false,
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Text(
                      _search.city.isNotEmpty
                          ? 'Cherry House chưa có cơ sở ở tỉnh/thành này'
                          : 'Không tìm thấy cơ sở',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.all(16),
                sliver: SliverList.separated(
                  itemCount: _list.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (_, i) {
                    final p = _list[i];
                    return PropertyCard(
                      property: p,
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => PropertyDetailScreen(property: p, search: _search),
                        ),
                      ),
                    );
                  },
                ),
              ),
          ],
        ],
      ),
    );
  }
}
