import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_text_styles.dart';

/// MealWise Global Theme (Light + Dark)
/// Style: Apple Minimal + Fitness Accent
/// Radius: 12px

class AppTheme {
  static final BorderRadius standardRadius = BorderRadius.circular(12);

  // -----------------------------
  // LIGHT THEME
  // -----------------------------
  static ThemeData lightTheme = ThemeData(
    brightness: Brightness.light,
    colorScheme: const ColorScheme.light(
      primary: AppColors.brandPrimary,
      secondary: AppColors.brandSecondary,
      surface: AppColors.lightCard,
    ),

    scaffoldBackgroundColor: AppColors.lightBackground,

    useMaterial3: true,

    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.lightBackground,
      elevation: 0,
      iconTheme: IconThemeData(color: AppColors.lightTextPrimary),
      titleTextStyle: AppTextStyles.title,
    ),

    // Cards (LIGHT)
    cardTheme: CardThemeData(
      color: AppColors.lightCard,
      margin: EdgeInsets.all(12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(12)),
      ),
      elevation: 1,
      shadowColor: AppColors.lightShadow,
    ),

    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.brandPrimary,
        foregroundColor: Colors.white,
        textStyle: AppTextStyles.button,
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 24),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    ),

    textTheme: TextTheme(
      headlineMedium: AppTextStyles.headline,
      titleMedium: AppTextStyles.title,
      bodyMedium: AppTextStyles.body,
      bodySmall: AppTextStyles.caption,
    ),

    dividerColor: AppColors.lightDivider,
  );

  // -----------------------------
  // DARK THEME
  // -----------------------------
  static ThemeData darkTheme = ThemeData(
    brightness: Brightness.dark,
    colorScheme: const ColorScheme.dark(
      primary: AppColors.brandPrimary,
      secondary: AppColors.brandSecondary,
      surface: AppColors.darkCard,
    ),

    scaffoldBackgroundColor: AppColors.darkBackground,

    useMaterial3: true,

    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.darkBackground,
      elevation: 0,
      iconTheme: IconThemeData(color: AppColors.darkTextPrimary),
      titleTextStyle: TextStyle(
        fontFamily: 'Montserrat',
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: AppColors.darkTextPrimary,
      ),
    ),

    // Cards (DARK)
    cardTheme: CardThemeData(
      color: AppColors.darkCard,
      margin: EdgeInsets.all(12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(12)),
      ),
      elevation: 1,
      shadowColor: AppColors.darkShadow,
    ),

    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.brandPrimary,
        foregroundColor: Colors.white,
        textStyle: AppTextStyles.button,
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 24),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    ),

    textTheme: TextTheme(
      headlineMedium: AppTextStyles.headline.copyWith(color: AppColors.darkTextPrimary),
      titleMedium: AppTextStyles.title.copyWith(color: AppColors.darkTextPrimary),
      bodyMedium: AppTextStyles.body.copyWith(color: AppColors.darkTextPrimary),
      bodySmall: AppTextStyles.caption.copyWith(color: AppColors.darkTextSecondary),
    ),

    dividerColor: AppColors.darkDivider,
  );
}
