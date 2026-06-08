import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

enum BookingStep { property, branch, rooms, checkout }

class BookingProgressBar extends StatelessWidget {
  const BookingProgressBar({super.key, required this.current});

  final BookingStep current;

  static const _labels = ['Cơ sở', 'Chi nhánh', 'Phòng', 'Thanh toán'];

  @override
  Widget build(BuildContext context) {
    final index = current.index;
    return Row(
      children: List.generate(_labels.length * 2 - 1, (i) {
        if (i.isOdd) {
          final step = i ~/ 2;
          return Expanded(
            child: Container(
              height: 2,
              color: step < index
                  ? AppColors.primary
                  : Colors.black.withValues(alpha: 0.08),
            ),
          );
        }
        final step = i ~/ 2;
        final active = step <= index;
        return Column(
          children: [
            CircleAvatar(
              radius: 14,
              backgroundColor: active ? AppColors.primary : AppColors.surfaceContainer,
              child: Text(
                '${step + 1}',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: active ? Colors.white : AppColors.onSurfaceVariant,
                ),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              _labels[step],
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    fontSize: 9,
                    fontWeight: FontWeight.w600,
                    color: active ? AppColors.primary : AppColors.onSurfaceVariant,
                  ),
            ),
          ],
        );
      }),
    );
  }
}
