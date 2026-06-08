import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_colors.dart';

abstract final class AppTheme {
  static ThemeData light() {
    final headline = GoogleFonts.beVietnamPro();
    final body = GoogleFonts.manrope();

    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.light(
        primary: AppColors.primary,
        onPrimary: AppColors.onPrimary,
        surface: AppColors.surface,
        onSurface: AppColors.onSurface,
      ),
      scaffoldBackgroundColor: AppColors.surface,
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.white.withValues(alpha: 0.95),
        foregroundColor: AppColors.onSurface,
        elevation: 0,
        scrolledUnderElevation: 0.5,
        titleTextStyle: headline.copyWith(
          fontWeight: FontWeight.w700,
          fontSize: 20,
          color: AppColors.onSurface,
        ),
      ),
      textTheme: TextTheme(
        displayLarge: headline.copyWith(fontWeight: FontWeight.w800),
        displayMedium: headline.copyWith(fontWeight: FontWeight.w800),
        displaySmall: headline.copyWith(fontWeight: FontWeight.w700),
        headlineMedium: headline.copyWith(fontWeight: FontWeight.w700),
        headlineSmall: headline.copyWith(fontWeight: FontWeight.w700),
        titleLarge: headline.copyWith(fontWeight: FontWeight.w700),
        titleMedium: headline.copyWith(fontWeight: FontWeight.w600),
        bodyLarge: body.copyWith(fontWeight: FontWeight.w500),
        bodyMedium: body,
        bodySmall: body.copyWith(color: AppColors.onSurfaceVariant),
        labelLarge: body.copyWith(fontWeight: FontWeight.w700),
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: Colors.black.withValues(alpha: 0.05)),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.onPrimary,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: body.copyWith(fontWeight: FontWeight.w700, fontSize: 14),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.black.withValues(alpha: 0.1)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.black.withValues(alpha: 0.1)),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: Colors.white,
        indicatorColor: AppColors.primary.withValues(alpha: 0.12),
        labelTextStyle: WidgetStatePropertyAll(
          body.copyWith(fontSize: 11, fontWeight: FontWeight.w600),
        ),
      ),
    );
  }
}
