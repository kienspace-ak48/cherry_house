import 'package:flutter/material.dart';

import '../../theme/app_colors.dart';

final _emailRe = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');

class HomeNewsletterSection extends StatefulWidget {
  const HomeNewsletterSection({
    super.key,
    required this.title,
    required this.description,
    required this.placeholder,
    required this.buttonLabel,
    required this.successMessage,
  });

  final String title;
  final String description;
  final String placeholder;
  final String buttonLabel;
  final String successMessage;

  @override
  State<HomeNewsletterSection> createState() => _HomeNewsletterSectionState();
}

class _HomeNewsletterSectionState extends State<HomeNewsletterSection> {
  final _emailCtrl = TextEditingController();
  bool _submitted = false;
  String? _error;

  @override
  void dispose() {
    _emailCtrl.dispose();
    super.dispose();
  }

  void _submit() {
    final value = _emailCtrl.text.trim();
    if (!_emailRe.hasMatch(value)) {
      setState(() => _error = 'Vui lòng nhập email hợp lệ.');
      return;
    }
    setState(() {
      _error = null;
      _submitted = true;
      _emailCtrl.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.primary,
      padding: const EdgeInsets.fromLTRB(20, 40, 20, 40),
      child: Column(
        children: [
          Text(
            widget.title,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: 12),
          Text(
            widget.description,
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white.withValues(alpha: 0.85), height: 1.5),
          ),
          const SizedBox(height: 20),
          if (_submitted)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Text(
                widget.successMessage,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w500),
              ),
            )
          else ...[
            TextField(
              controller: _emailCtrl,
              keyboardType: TextInputType.emailAddress,
              decoration: InputDecoration(
                hintText: widget.placeholder,
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(28), borderSide: BorderSide.none),
                errorText: _error,
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: _submit,
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.onSurface,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
                ),
                child: Text(widget.buttonLabel, style: const TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
