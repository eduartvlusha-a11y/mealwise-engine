import 'package:flutter/material.dart';
import 'package:mealwise_app/core/services/home_service.dart';
import 'home_state.dart';

class HomeProvider extends ChangeNotifier {
  final HomeService _service = HomeService();
  HomeState state = HomeState(isLoading: false);

  Future<void> loadHome() async {
    // 🔒 START LOADING (ONCE)
    state = state.copyWith(isLoading: true, error: null);
    notifyListeners();

    try {
      final homeData = await _service.getHomeData().timeout(
        const Duration(seconds: 10),
      );

      // =============================
      // HARD GATE — ONBOARDING
      // =============================
      if (homeData['needsOnboarding'] == true) {
        state = state.copyWith(
          isLoading: false,
          data: {'needsOnboarding': true},
        );
        return;
      }

      // =============================
      // HARD GATE — NO ACTIVE PLAN
      // =============================
      if (homeData['hasPlan'] == false) {
        state = state.copyWith(
          isLoading: false,
          data: {'hasActivePlan': false},
        );
        return;
      }

      // =============================
      // CORE DATA
      // =============================
      final weekPlan = homeData['weekPlan'];
      final metrics = homeData['metrics'];
      final bool planIsExpired = homeData['planIsExpired'] == true;

      // =============================
      // EATEN MEALS (NON-BLOCKING)
      // =============================
      List<Map<String, dynamic>> eatenMeals = [];
      try {
        eatenMeals = await _service.getTodayEatenMeals().timeout(
          const Duration(seconds: 5),
        );
      } catch (_) {
        eatenMeals = [];
      }

      final Set<String> eatenKeys = {};
      for (final m in eatenMeals) {
        eatenKeys.add((m['templateId'] ?? m['name']).toString());
      }

      // =============================
      // TODAY PLAN — BACKEND FIRST
      // =============================
      Map<String, dynamic>? todayPlan = (homeData['todayPlan'] as Map?)
          ?.cast<String, dynamic>();

      // FALLBACK ONLY if backend did NOT provide todayPlan
      if (todayPlan == null && weekPlan != null && weekPlan['days'] != null) {
        final days = List<Map<String, dynamic>>.from(weekPlan['days']);

        // 🔒 Sort by date ASC (deterministic)
        days.sort((a, b) {
          final da = DateTime.parse(a['date'].toString());
          final db = DateTime.parse(b['date'].toString());
          return da.compareTo(db);
        });

        final now = DateTime.now();

        Map<String, dynamic>? resolvedDay;

        // 1️⃣ Try exact calendar match
        for (final day in days) {
          final date = DateTime.parse(day['date'].toString());

          if (date.year == now.year &&
              date.month == now.month &&
              date.day == now.day) {
            resolvedDay = day;
            break;
          }
        }

        // 2️⃣ If today is outside plan range → use LAST plan day
        resolvedDay ??= days.last;

        final plan = resolvedDay['plan'];
        final meals = resolvedDay['meals'];

        todayPlan = plan != null
            ? plan.cast<String, dynamic>()
            : {'meals': meals ?? []};
      }

      final meals = (todayPlan?['meals'] as List?) ?? [];

      // =============================
      // FINAL STATE (ONE WRITE)
      // =============================
      state = state.copyWith(
        isLoading: false,
        data: {
          'weekPlan': weekPlan,
          'metrics': metrics,
          'todayPlan': todayPlan,
          'planIsExpired': planIsExpired,
          'today': {
            'meals': meals,
            'calories': meals.fold<int>(
              0,
              (sum, m) => sum + ((m['calories'] ?? 0) as num).round(),
            ),
            'protein': meals.fold<int>(
              0,
              (sum, m) => sum + ((m['protein'] ?? 0) as num).round(),
            ),
            'carbs': meals.fold<int>(
              0,
              (sum, m) => sum + ((m['carbs'] ?? 0) as num).round(),
            ),
            'fats': meals.fold<int>(
              0,
              (sum, m) => sum + ((m['fats'] ?? 0) as num).round(),
            ),
          },
          'eatenKeys': eatenKeys,
        },
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    } finally {
      // 🔓 UNLOCK UI (ONCE)
      notifyListeners();
    }
  }

  Future<void> startPlan() async {
    await _service.startPlan();
    await loadHome();
  }

  Future<void> regeneratePlan() async {
    // 🔒 Do NOT mark regenerate as fatal
    state = state.copyWith(isLoading: true, error: null);
    notifyListeners();

    try {
      await _service.regenerateWeek();

      // 🔥 IMPORTANT:
      // Reload home WITHOUT letting temporary states throw UI errors
      await loadHome();
    } catch (_) {
      // ❌ DO NOTHING
      // Regenerate failures must NOT break Home screen
    } finally {
      state = state.copyWith(isLoading: false);
      notifyListeners();
    }
  }

  void reset() {
    state = HomeState(isLoading: false, data: null, error: null);
    notifyListeners();
  }
}
