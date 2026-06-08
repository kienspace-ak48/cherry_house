import 'package:flutter/material.dart';

import '../data/fake_data.dart';
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
  late List<Property> _list;

  @override
  void initState() {
    super.initState();
    _search = widget.initialSearch ?? const BookingSearch();
    _list = FakeData.filterProperties(_search);
  }

  void _applySearch(BookingSearch s) {
    setState(() {
      _search = s;
      _list = FakeData.filterProperties(s);
    });
  }

  @override
  Widget build(BuildContext context) {
    final summary = [
      if (_search.city.isNotEmpty) _search.city,
      if (_search.kind != 'all') FakeData.kindOptions[_search.kind],
    ].where((e) => e != null && e.isNotEmpty).join(' · ');

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
                    'Dữ liệu demo (fake)',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.roomAvailable),
                  ),
                ],
              ),
            ),
          ),
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
            const SliverFillRemaining(
              hasScrollBody: false,
              child: Center(child: Text('Không tìm thấy cơ sở')),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.all(16),
              sliver: SliverList.separated(
                itemCount: _list.length,
                separatorBuilder: (_, __) => const SizedBox(height: 16),
                itemBuilder: (context, i) {
                  final p = _list[i];
                  return PropertyCard(
                    property: p,
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => PropertyDetailScreen(
                          property: p,
                          search: _search,
                        ),
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
