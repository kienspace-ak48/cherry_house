import 'package:flutter/material.dart';

import '../app_services.dart';
import '../constants/catalog_constants.dart';
import '../models/models.dart';
import '../theme/app_colors.dart';

class BookingSearchBar extends StatefulWidget {
  const BookingSearchBar({
    super.key,
    this.initial,
    this.compact = false,
    required this.onSearch,
  });

  final BookingSearch? initial;
  final bool compact;
  final ValueChanged<BookingSearch> onSearch;

  @override
  State<BookingSearchBar> createState() => _BookingSearchBarState();
}

class _BookingSearchBarState extends State<BookingSearchBar> {
  String _city = '';
  String _kind = 'all';
  DateTime? _checkIn;
  DateTime? _checkOut;
  List<String> _cityOptions = CatalogConstants.provinceOptions;
  bool _loadingCities = true;

  @override
  void initState() {
    super.initState();
    _city = widget.initial?.city ?? '';
    _kind = widget.initial?.kind ?? 'all';
    _checkIn = widget.initial?.checkIn;
    _checkOut = widget.initial?.checkOut;
    _loadProvinces();
  }

  Future<void> _loadProvinces() async {
    try {
      final rows = await AppServices.I.geoApi.fetchProvinces();
      if (!mounted) return;
      final provinces = rows
          .map((p) => p['name']?.toString() ?? '')
          .where((s) => s.isNotEmpty)
          .toList();
      if (provinces.isNotEmpty) {
        setState(() {
          _cityOptions = provinces;
          if (_city.isNotEmpty && !_cityOptions.contains(_city)) {
            _cityOptions = [..._cityOptions, _city];
          }
        });
      }
    } catch (_) {
      // fallback CatalogConstants
    } finally {
      if (mounted) setState(() => _loadingCities = false);
    }
  }

  Future<void> _pickDate(bool isCheckIn) async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: (isCheckIn ? _checkIn : _checkOut) ?? now.add(const Duration(days: 1)),
      firstDate: now,
      lastDate: now.add(const Duration(days: 365)),
    );
    if (picked == null) return;
    setState(() {
      if (isCheckIn) {
        _checkIn = picked;
        if (_checkOut != null && !_checkOut!.isAfter(_checkIn!)) {
          _checkOut = _checkIn!.add(const Duration(days: 1));
        }
      } else {
        _checkOut = picked;
      }
    });
  }

  void _submit() {
    widget.onSearch(BookingSearch(
      city: _city,
      checkIn: _checkIn,
      checkOut: _checkOut,
      kind: _kind,
    ));
  }

  @override
  Widget build(BuildContext context) {
    final padding = widget.compact ? 12.0 : 16.0;
    return Container(
      padding: EdgeInsets.all(padding),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          DropdownButtonFormField<String>(
            value: _city.isEmpty ? null : _city,
            decoration: InputDecoration(
              labelText: 'Tỉnh/thành',
              prefixIcon: const Icon(Icons.location_on_outlined, color: AppColors.primary),
              suffixIcon: _loadingCities
                  ? const Padding(
                      padding: EdgeInsets.all(12),
                      child: SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                    )
                  : null,
            ),
            hint: const Text('Tất cả tỉnh/thành'),
            items: [
              const DropdownMenuItem(value: '', child: Text('Tất cả tỉnh/thành')),
              ..._cityOptions.map((c) => DropdownMenuItem(value: c, child: Text(c))),
            ],
            onChanged: _loadingCities ? null : (v) => setState(() => _city = v ?? ''),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _pickDate(true),
                  icon: const Icon(Icons.calendar_today, size: 18),
                  label: Text(
                    _checkIn == null ? 'Nhận phòng' : _formatDate(_checkIn!),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _pickDate(false),
                  icon: const Icon(Icons.event_outlined, size: 18),
                  label: Text(
                    _checkOut == null ? 'Trả phòng' : _formatDate(_checkOut!),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ),
            ],
          ),
          if (!widget.compact) ...[
            const SizedBox(height: 10),
            DropdownButtonFormField<String>(
              initialValue: _kind,
              decoration: const InputDecoration(labelText: 'Loại hình'),
              items: CatalogConstants.kindOptions.entries
                  .map((e) => DropdownMenuItem(value: e.key, child: Text(e.value)))
                  .toList(),
              onChanged: (v) => setState(() => _kind = v ?? 'all'),
            ),
          ],
          const SizedBox(height: 12),
          FilledButton.icon(
            onPressed: _submit,
            icon: const Icon(Icons.search),
            label: const Text('Tìm phòng trống'),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime d) =>
      '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';
}
