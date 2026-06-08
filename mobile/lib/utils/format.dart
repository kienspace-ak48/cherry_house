import 'package:intl/intl.dart';

String formatPriceVnd(int amount) {
  final fmt = NumberFormat.currency(locale: 'vi_VN', symbol: '₫', decimalDigits: 0);
  return fmt.format(amount);
}

String formatPriceFrom(int amount) => 'Từ ${formatPriceVnd(amount)}';

String formatDateShort(DateTime? date) {
  if (date == null) return '';
  return DateFormat('d MMM', 'vi').format(date);
}
