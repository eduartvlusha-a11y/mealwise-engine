import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../home/home_provider.dart';

class PlannerScreen extends StatelessWidget {
  const PlannerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final homeState = context.watch<HomeProvider>().state;
    final home = homeState.data;

    // We read ONLY weekPlan for Planner.
    final weekPlan = home?['weekPlan'];
    final days = (weekPlan?['days'] as List?)?.cast<dynamic>() ?? [];

    return Scaffold(
      appBar: AppBar(title: const Text('Weekly Planner'), centerTitle: true),
      body: days.isEmpty
          ? const Center(
              child: Text(
                'Weekly plan unavailable',
                style: TextStyle(fontSize: 16, color: Colors.grey),
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: days.length,
              separatorBuilder: (_, __) => const SizedBox(height: 14),
              itemBuilder: (context, index) {
                final day = days[index] as Map;
                final dateStr = (day['date'] ?? '').toString();
                final meals = (day['meals'] as List?)?.cast<dynamic>() ?? [];

                String titleFromDate(String iso) {
                  try {
                    final d = DateTime.parse(iso);
                    const names = [
                      'Monday',
                      'Tuesday',
                      'Wednesday',
                      'Thursday',
                      'Friday',
                      'Saturday',
                      'Sunday',
                    ];
                    return names[d.weekday - 1];
                  } catch (_) {
                    return 'Day ${index + 1}';
                  }
                }

                Map? mealByCategory(String category) {
                  for (final m in meals) {
                    final mm = m as Map;
                    if ((mm['category'] ?? '').toString() == category) {
                      return mm;
                    }
                  }
                  return null;
                }

                Widget mealRow(String label, String category) {
                  final m = mealByCategory(category);

                  if (m == null) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SizedBox(
                            width: 90,
                            child: Text(
                              label,
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: const [
                                Text(
                                  '— No suitable meal available',
                                  style: TextStyle(color: Colors.grey),
                                ),
                                SizedBox(height: 2),
                                Text(
                                  'Limited variety this week',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  }

                  final name = (m['name'] ?? 'Meal').toString();
                  final calories = m['calories'];
                  final kcalText = calories == null ? '' : ' — $calories kcal';

                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(
                          width: 90,
                          child: Text(
                            label,
                            style: const TextStyle(fontWeight: FontWeight.w600),
                          ),
                        ),
                        Expanded(
                          child: Text(
                            '$name$kcalText',
                            style: const TextStyle(fontSize: 14),
                          ),
                        ),
                      ],
                    ),
                  );
                }

                return Container(
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
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Day header
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              titleFromDate(dateStr),
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          if (dateStr.isNotEmpty)
                            Text(
                              dateStr,
                              style: const TextStyle(
                                fontSize: 12,
                                color: Colors.grey,
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      const Divider(height: 1),

                      // Fixed meal order (LOCKED)
                      mealRow('Breakfast', 'breakfast'),
                      mealRow('Lunch', 'lunch'),
                      mealRow('Dinner', 'dinner'),
                      mealRow('Snack', 'snack'),
                    ],
                  ),
                );
              },
            ),
    );
  }
}
