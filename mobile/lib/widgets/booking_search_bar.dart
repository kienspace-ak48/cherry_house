import 'package:flutter/material.dart';

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
  late final TextEditingController _cityCtrl;
  String _kind = 'all';
  DateTime? _checkIn;
  DateTime? _checkOut;

  @override
  void initState() {
    super.initState();
    _cityCtrl = TextEditingController(text: widget.initial?.city ?? '');
    _kind = widget.initial?.kind ?? 'all';
    _checkIn = widget.initial?.checkIn;
    _checkOut = widget.initial?.checkOut;
  }

  @override
  void dispose() {
    _cityCtrl.dispose();
    super.dispose();
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
      city: _cityCtrl.text.trim(),
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
          Autocomplete<String>(
            optionsBuilder: (text) {
              final q = text.text.toLowerCase();
              return CatalogConstants.cityOptions.where((c) => c.toLowerCase().contains(q));
            },
            onSelected: (v) => _cityCtrl.text = v,
            fieldViewBuilder: (_, controller, focusNode, __) {
              if (controller.text.isEmpty && _cityCtrl.text.isNotEmpty) {
                controller.text = _cityCtrl.text;
              }
              controller.addListener(() => _cityCtrl.text = controller.text);
              return TextField(
                controller: controller,
                focusNode: focusNode,
                decoration: const InputDecoration(
                  labelText: 'Địa điểm',
                  prefixIcon: Icon(Icons.location_on_outlined, color: AppColors.primary),
                ),
              );
            },
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
              value: _kind,
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
