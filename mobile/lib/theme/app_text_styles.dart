import 'package:flutter/material.dart';
import 'app_colors.dart';

/// MealWise Typography System
/// Font: Montserrat (Bold, SemiBold, Medium, Regular)

class AppTextStyles {
  // -----------------------------
  // DISPLAY & HEADLINES
  // -----------------------------
  static const TextStyle display = TextStyle(
    fontFamily: 'Montserrat',
    fontWeight: FontWeight.w700,
    fontSize: 32,
    color: AppColors.lightTextPrimary,
  );

  static const TextStyle headline = TextStyle(
    fontFamily: 'Montserrat',
    fontWeight: FontWeight.w600,
    fontSize: 26,
    color: AppColors.lightTextPrimary,
  );

  // -----------------------------
  // TITLES
  // -----------------------------
  static const TextStyle title = TextStyle(
    fontFamily: 'Montserrat',
    fontWeight: FontWeight.w600,
    fontSize: 20,
    color: AppColors.lightTextPrimary,
  );

  static const TextStyle subtitle = TextStyle(
    fontFamily: 'Montserrat',
    fontWeight: FontWeight.w500,
    fontSize: 16,
    color: AppColors.lightTextSecondary,
  );

  // -----------------------------
  // BODY TEXT
  // -----------------------------
  static const TextStyle body = TextStyle(
    fontFamily: 'Montserrat',
    fontWeight: FontWeight.w400,
    fontSize: 15,
    color: AppColors.lightTextPrimary,
  );

  static const TextStyle bodySecondary = TextStyle(
    fontFamily: 'Montserrat',
    fontWeight: FontWeight.w400,
    fontSize: 15,
    color: AppColors.lightTextSecondary,
  );

  // -----------------------------
  // SMALL TEXT
  // -----------------------------
  static const TextStyle caption = TextStyle(
    fontFamily: 'Montserrat',
    fontWeight: FontWeight.w400,
    fontSize: 13,
    color: AppColors.lightTextSecondary,
  );

  // -----------------------------
  // BUTTON TEXT
  // -----------------------------
  static const TextStyle button = TextStyle(
    fontFamily: 'Montserrat',
    fontWeight: FontWeight.w600,
    fontSize: 16,
    color: Colors.white,
  );

  // ------------------------------------------------------
  // 🔥 ADDED FOR LOGIN SCREEN COMPATIBILITY (MAPPING)
  // ------------------------------------------------------

  /// LoginScreen expects this → map it to your display style
  static const TextStyle headingLarge = display;

  /// LoginScreen expects this → map it to your body style
  static const TextStyle bodyMedium = body;

  /// LoginScreen expects this → map it to your caption style
  static const TextStyle bodySmall = caption;

  /// LoginScreen expects this → map it to your button style
  static const TextStyle buttonMedium = button;
}
