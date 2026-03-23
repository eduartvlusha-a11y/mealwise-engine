import 'package:flutter/material.dart';

/// MealWise Global Color System
/// Light + Dark Themes
/// Brand Style: Apple Minimal + Fitness Accent
/// Rounded Radius: 12px (handled in theme)

class AppColors {
  // -----------------------------
  // BRAND COLORS
  // -----------------------------
  static const Color brandPrimary = Color(0xFF6C63B3); // Purple (Wise)
  static const Color brandSecondary = Color(0xFF809B57); // Olive (Meal)

  // -----------------------------
  // LIGHT THEME COLORS
  // -----------------------------
  static const Color lightBackground = Color(0xFFFFFFFF);
  static const Color lightCard = Color(0xFFF9F9F9);
  static const Color lightSurface = Color(0xFFF4F4F4);
  static const Color lightShadow = Color(0x1A000000); // 10% black

  static const Color lightTextPrimary = Color(0xFF222222);
  static const Color lightTextSecondary = Color(0xFF6F6F6F);

  static const Color lightDivider = Color(0xFFE3E3E3);

  // -----------------------------
  // DARK THEME COLORS
  // -----------------------------
  static const Color darkBackground = Color(0xFF121212);
  static const Color darkCard = Color(0xFF1E1E1E);
  static const Color darkSurface = Color(0xFF2A2A2A);
  static const Color darkShadow = Color(0x66000000);

  static const Color darkTextPrimary = Color(0xFFFFFFFF);
  static const Color darkTextSecondary = Color(0xFFB5B5B5);

  static const Color darkDivider = Color(0xFF3A3A3A);

  // -----------------------------
  // STATUS COLORS
  // -----------------------------
  static const Color success = Color(0xFF4CAF50);
  static const Color error = Color(0xFFE53935);
  static const Color warning = Color(0xFFFBC02D);

  // ----------------------------------------------------
  // 🔥 ADDED FOR LOGIN SCREEN COMPATIBILITY (MAPPING)
  // ----------------------------------------------------

  /// LoginScreen expects AppColors.primary → map to brandPrimary
  static const Color primary = brandPrimary;

  /// LoginScreen expects AppColors.textPrimary → map to lightTextPrimary (or theme logic later)
  static const Color textPrimary = lightTextPrimary;

  /// LoginScreen expects AppColors.textSecondary → map to lightTextSecondary
  static const Color textSecondary = lightTextSecondary;
}
