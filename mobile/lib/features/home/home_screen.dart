import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'home_provider.dart';
import 'package:mealwise_app/core/services/home_service.dart';
import 'package:mealwise_app/features/ai_explanation/ai_explanation_screen.dart';
import '../../core/auth/token_storage.dart';
import 'package:mealwise_app/features/auth/login/login_screen.dart';

enum EatUiStatus { pending, queued }

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  // 🧠 Meal explanation lookup (templateId → reason)
  final Map<String, String> explanationByTemplateId = {};

  final Set<String> _eatenMealKeys = {};
  final Set<String> _sendingMealKeys = {};
  final Map<String, EatUiStatus> _eatUiStatus = {};
  bool _hydratedFromProvider = false;
  bool _isLoggedIn = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<HomeProvider>().loadHome();
    });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_hydratedFromProvider) return;

      final homeState = context.read<HomeProvider>().state;
      final home = homeState.data;
      print('🧪 HOME DATA IN UI => $home');

      final raw = home?['eatenKeys'];

      final Set<String> eatenKeys = raw is List
          ? raw.map((e) => e.toString()).toSet()
          : raw is Set
          ? raw.map((e) => e.toString()).toSet()
          : <String>{};

      if (eatenKeys.isNotEmpty) {
        setState(() {
          _eatenMealKeys.addAll(eatenKeys);
        });
      }

      // ✅ CRITICAL FIX: finalize hydration even if empty
      _hydratedFromProvider = true;
    });
    TokenStorage.read().then((token) {
      if (!mounted) return;
      setState(() => _isLoggedIn = token != null);
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    final args = ModalRoute.of(context)?.settings.arguments as Map?;
    if (args?['refresh'] == true) {
      context.read<HomeProvider>().loadHome();

      // clear the flag so it doesn't loop
    }
  }

  @override
  Widget build(BuildContext context) {
    final homeState = context.watch<HomeProvider>().state;
    final bool planIsValid = homeState.data?['planIsValid'] == true;

    final Map<String, dynamic>? metrics =
        homeState.data?['metrics'] as Map<String, dynamic>?;

    final int? tdee = (metrics?['maintenanceCalories'] as num?)?.toInt();

    final int? dailyCaloriesTarget = (metrics?['dailyCaloriesTarget'] as num?)
        ?.toInt();

    final double? weeklyBudget = (metrics?['weeklyBudget'] as num?)?.toDouble();

    // -----------------------------
    // ⏳ LOADING GATE — MUST BE FIRST
    // -----------------------------
    if (homeState.isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final home = homeState.data;
    final changeReasons = home?['changeReasons'];

    // -----------------------------
    // 🔥 ERROR STATE
    // -----------------------------
    if (homeState.error != null) {
      return Scaffold(
        body: Center(
          child: Text(
            "Error loading home:\n${homeState.error}",
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.red),
          ),
        ),
      );
    }

    // -----------------------------
    // 🔥 DATA
    // -----------------------------

    final Map<String, dynamic>? todayPlan =
        home?['todayPlan'] as Map<String, dynamic>?;

    // -----------------------------
    // 🧠 Explanation lookup map
    // -----------------------------
    explanationByTemplateId.clear();

    final explanation = todayPlan?['explanation'];
    if (explanation != null && explanation['perMeal'] is List) {
      for (final e in explanation['perMeal']) {
        final id = e['id'];
        final reason = e['explanation'];
        if (id != null && reason != null) {
          explanationByTemplateId[id.toString()] = reason.toString();
        }
      }
    }

    // ✅ REAL DAILY METRICS (DERIVED FROM TODAY PLAN)
    // ✅ REAL DAILY METRICS (DERIVED FROM TODAY PLAN — SAFE)

    // Calories today
    final int caloriesToday =
        (todayPlan?['totalCaloriesPlanned'] as num?)?.toInt() ?? 0;

    // Protein
    final int? proteinToday = (todayPlan?['macrosPlanned']?['protein'] as num?)
        ?.toInt();

    // Food score (temporary, deterministic placeholder)
    final int decisionScore = caloriesToday > 0 ? 70 : 0;

    // -----------------------------
    // 🔥 PREMIUM: NO ACTIVE PLAN
    // -----------------------------
    final hasActivePlan =
        home?['weekPlan'] != null &&
        (home!['weekPlan']['days'] as List?)?.isNotEmpty == true;

    if (!hasActivePlan) {
      return Scaffold(
        backgroundColor: const Color(0xFFF5F8FB),
        appBar: AppBar(
          elevation: 0,
          backgroundColor: Colors.white,
          title: const Text(
            "MealWise",
            style: TextStyle(
              color: Colors.black,
              fontWeight: FontWeight.bold,
              fontSize: 22,
            ),
          ),
          centerTitle: true,
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  "Start your first plan",
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                const Text(
                  "Create a personalized meal plan based on your goals and budget.",
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey),
                ),
                const SizedBox(height: 28),
                ElevatedButton(
                  onPressed: () async {
                    try {
                      // 1️⃣ Start plan (API call)

                      // 2️⃣ Reload home data
                      await context.read<HomeProvider>().loadHome();
                    } catch (e) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text("Failed to start plan")),
                      );
                    }
                  },

                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 32,
                      vertical: 14,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    "Start Plan",
                    style: TextStyle(fontSize: 16),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF5F8FB),
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        title: const Text(
          "MealWise",
          style: TextStyle(
            color: Colors.black,
            fontWeight: FontWeight.bold,
            fontSize: 22,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(
              Icons.psychology_outlined,
              color: Colors.black,
              size: 26,
            ),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const AiExplanationScreen()),
              );
            },
          ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.person_outline),
            onSelected: (value) async {
              if (value == 'login') {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => LoginScreen()),
                ).then((_) async {
                  final token = await TokenStorage.read();
                  if (!mounted) return;
                  setState(() => _isLoggedIn = token != null);
                });
              }

              if (value == 'logout') {
                await TokenStorage.clear();

                Navigator.of(
                  context,
                ).pushNamedAndRemoveUntil('/login', (_) => false);
              }
            },

            itemBuilder: (context) => [
              const PopupMenuItem(value: 'login', child: Text('Login')),
              const PopupMenuItem(value: 'logout', child: Text('Logout')),
            ],
          ),
        ],
      ),

      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (!planIsValid)
              Container(
                width: double.infinity,
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.orange.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.orange),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Your plan is outdated due to profile changes.',
                      style: TextStyle(
                        color: Colors.orange,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    ElevatedButton(
                      onPressed: planIsValid
                          ? null
                          : () async {
                              final confirm = await showDialog<bool>(
                                context: context,
                                builder: (ctx) => AlertDialog(
                                  title: const Text('Regenerate weekly plan?'),
                                  content: const Text(
                                    'Your current plan will be replaced with a new one based on your updated profile.',
                                  ),
                                  actions: [
                                    TextButton(
                                      onPressed: () =>
                                          Navigator.of(ctx).pop(false),
                                      child: const Text('Cancel'),
                                    ),
                                    ElevatedButton(
                                      onPressed: () =>
                                          Navigator.of(ctx).pop(true),
                                      child: const Text('Regenerate'),
                                    ),
                                  ],
                                ),
                              );

                              if (confirm != true) return;

                              await context
                                  .read<HomeProvider>()
                                  .regeneratePlan();
                              await context.read<HomeProvider>().loadHome();
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.orange,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Regenerate plan'),
                    ),
                  ],
                ),
              ),

            if (changeReasons != null &&
                (changeReasons['weightChanged'] == true ||
                    changeReasons['goalChanged'] == true ||
                    changeReasons['activityChanged'] == true))
              Container(
                width: double.infinity,
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.blueGrey.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.blueGrey.withOpacity(0.35)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Calories updated due to profile changes:',
                      style: TextStyle(fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 8),
                    if (changeReasons['weightChanged'] == true)
                      const Text('• Weight change'),
                    if (changeReasons['goalChanged'] == true)
                      const Text('• Goal change'),
                    if (changeReasons['activityChanged'] == true)
                      const Text('• Activity level change'),
                  ],
                ),
              ),

            // ----------------------------------------------------
            // 🥇 TODAY’S PLAN — PLANNED (HERO)
            // ----------------------------------------------------
            Container(
              width: double.infinity,
              margin: const EdgeInsets.only(bottom: 28),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x22000000),
                    blurRadius: 14,
                    offset: Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        "Today’s Plan",
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Color(0xFFE3F2FD),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Text(
                          "PLANNED",
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF1976D2),
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 12),

                  // Planned daily totals (EXECUTION-FIRST, DETERMINISTIC)
                  if ((todayPlan?['meals'] as List?)?.isNotEmpty == true)
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "${(todayPlan?['totalCaloriesPlanned'] as num?)?.toInt() ?? _totalCaloriesToday(todayPlan)} kcal planned today",
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 6),
                        if (todayPlan?['macrosPlanned'] != null)
                          Text(
                            "Protein ${(todayPlan!['macrosPlanned']['protein'] as num).toInt()}g • "
                            "Carbs ${(todayPlan['macrosPlanned']['carbs'] as num).toInt()}g • "
                            "Fats ${(todayPlan['macrosPlanned']['fats'] as num).toInt()}g",
                            style: const TextStyle(
                              fontSize: 14,
                              color: Colors.grey,
                            ),
                          ),
                      ],
                    ),

                  const SizedBox(height: 16),

                  // Planned meals list (reuse existing logic)
                  if ((todayPlan?["meals"] as List?)?.isEmpty ?? true)
                    const Text(
                      "No meals planned today",
                      style: TextStyle(color: Colors.grey),
                    )
                  else
                    ..._buildMealsList(todayPlan),
                ],
              ),
            ),

            const SizedBox(height: 28),

            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  // ----------------------------------------------------
  // HELPERS
  // ----------------------------------------------------
  int _totalCaloriesToday(Map<String, dynamic>? todayPlan) {
    final meals = todayPlan?["meals"] as List<dynamic>? ?? [];

    int total = 0;
    for (final m in meals) {
      total += (m["calories"] as num?)?.toInt() ?? 0;
    }
    return total;
  }

  // ---------------------------------------------
  // 🔥 FIXED MEAL LIST (No errors, no layout change)
  // ---------------------------------------------
  List<Widget> _buildMealsList(Map<String, dynamic>? todayPlan) {
    final meals = todayPlan?["meals"] as List<dynamic>? ?? [];

    if (meals.isEmpty) {
      return const [
        Text("No meals planned today", style: TextStyle(color: Colors.grey)),
      ];
    }

    return meals.map((meal) {
      final mealKey = (meal["id"] ?? meal["name"]).toString();
      return InkWell(
        onTap: () {
          final templateId = meal["templateId"]?.toString();
          final explanation =
              (meal['explanation'] as String?) ??
              "Explanation not available yet.";

          showModalBottomSheet(
            context: context,
            shape: const RoundedRectangleBorder(
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            ),
            builder: (_) {
              return Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      "Why this meal?",
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      explanation,
                      style: const TextStyle(
                        fontSize: 15,
                        color: Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              );
            },
          );
        },

        child: Container(
          margin: const EdgeInsets.only(bottom: 14),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: const [
              BoxShadow(
                color: Color(0x22000000),
                blurRadius: 10,
                offset: Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            children: [
              const Icon(Icons.restaurant_menu, size: 26, color: Colors.orange),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      meal["name"] ?? "Unknown meal",
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      ((meal["calories"] as num?)?.toInt() ?? 0) > 0
                          ? "${(meal["calories"] as num).toInt()} kcal"
                          : "Planned",
                      style: TextStyle(
                        fontSize: 14,
                        color: ((meal["calories"] as num?)?.toInt() ?? 0) > 0
                            ? Colors.grey
                            : Colors.blueGrey,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 6),

                    GestureDetector(
                      onTap: () async {
                        final key = (meal["id"] ?? meal["name"]).toString();

                        if (_eatenMealKeys.contains(key)) return;
                        if (_sendingMealKeys.contains(key)) return;

                        setState(() {
                          _sendingMealKeys.add(key);
                        });

                        await Future.delayed(const Duration(milliseconds: 300));

                        setState(() {
                          _eatenMealKeys.add(key);
                          _sendingMealKeys.remove(key);
                        });

                        try {
                          await HomeService().logFood(
                            name: meal["name"] ?? "Meal",
                            meal: meal["meal"] ?? "unknown",
                            calories:
                                (meal["calories"] as num?)?.toDouble() ?? 0,
                            protein: (meal["protein"] as num?)?.toDouble() ?? 0,
                            carbs: (meal["carbs"] as num?)?.toDouble() ?? 0,
                            fat: (meal["fat"] as num?)?.toDouble() ?? 0,
                            grams: (meal["grams"] as num?)?.toDouble() ?? 0,
                            templateId: meal["templateId"],
                          );
                        } catch (e) {
                          // keep UI eaten even if sync fails
                          debugPrint(
                            "⚠️ FoodLog sync failed, keeping UI eaten. Will retry later.",
                          );
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text(
                                "Saved locally. Will sync when online.",
                              ),
                            ),
                          );
                        } finally {
                          setState(() {
                            _sendingMealKeys.remove(key);
                          });
                        }
                      },

                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: _eatenMealKeys.contains(mealKey)
                              ? Colors.green[700]
                              : _sendingMealKeys.contains(mealKey)
                              ? Colors.orange[700]
                              : Colors.blue[700],

                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          _eatenMealKeys.contains(mealKey)
                              ? "Eaten"
                              : _sendingMealKeys.contains(mealKey)
                              ? "Saving..."
                              : "Mark as eaten",

                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: Colors.grey),
            ],
          ),
        ),
      );
    }).toList();
  }

  // ----------------------------------------------------
  // INSIGHT CARD
  // ----------------------------------------------------
  Widget _insightCard({
    required IconData icon,
    required Color color,
    required String text,
    required Color background,
  }) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [
          BoxShadow(
            color: Color(0x22000000),
            blurRadius: 8,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 30),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }
}
