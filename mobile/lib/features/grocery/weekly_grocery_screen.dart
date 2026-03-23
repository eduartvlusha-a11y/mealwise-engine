import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mealwise_app/core/services/api_service.dart';

class WeeklyGroceryScreen extends StatefulWidget {
  const WeeklyGroceryScreen({super.key});

  @override
  State<WeeklyGroceryScreen> createState() => _WeeklyGroceryScreenState();
}

class _WeeklyGroceryScreenState extends State<WeeklyGroceryScreen> {
  bool _loading = true;
  List<dynamic> _items = [];
  double? _weeklyTotal;
  double? _weeklyBudget;
  String _currencySymbol = '€';

  @override
  void initState() {
    super.initState();

    _loadGrocery();
  }

  Future<void> _loadGrocery() async {
    try {
      final api = context.read<ApiService>();

      final response = await api.get('/mealwise/weekly-grocery');

      setState(() {
        final root = response.data;

        final grocery = root['grocery'];

        _items = grocery != null && grocery['items'] != null
            ? List.from(grocery['items'])
            : [];

        _weeklyTotal = (root['totalCost'] as num?)?.toDouble();
        _currencySymbol = root['currencySymbol'] ?? '€';
        _weeklyBudget = (root['weeklyBudget'] as num?)?.toDouble();

        _loading = false;
      });
    } catch (e) {
      setState(() {
        _loading = false;
      });
    }
  }

  String formatQuantity(num grams) {
    if (grams >= 1000) {
      final kg = grams / 1000;
      return '${kg.toStringAsFixed(2)} kg';
    }
    return '${grams.toStringAsFixed(0)} g';
  }

  @override
  Widget build(BuildContext context) {
    // STEP 3 — prepare grouped items (logic only, no UI yet)
    final Map<String, List<Map<String, dynamic>>> groupedItems = {};
    const categoryOrder = [
      'Produce',
      'Meat & Fish',
      'Dairy & Eggs',
      'Pantry',
      'Oils & Condiments',
      'Other',
    ];

    if (!_loading && _items.isNotEmpty) {
      for (final item in _items) {
        final name = (item['name'] ?? '').toString();
        final category = resolveGroceryCategory(name);

        groupedItems.putIfAbsent(category, () => []);
        groupedItems[category]!.add(item);
      }
    }

    final Map<String, List<Map<String, dynamic>>> orderedGroupedItems = {};

    for (final category in categoryOrder) {
      if (groupedItems.containsKey(category)) {
        orderedGroupedItems[category] = groupedItems[category]!;
      }
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Weekly Grocery')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _items.isEmpty
          ? const Center(child: Text('No grocery items found'))
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                if (_weeklyTotal != null)
                  Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color:
                          (_weeklyBudget != null &&
                              _weeklyTotal! <= _weeklyBudget!)
                          ? Colors.green.withOpacity(0.08)
                          : Colors.grey.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color:
                            (_weeklyBudget != null &&
                                _weeklyTotal! <= _weeklyBudget!)
                            ? Colors.green
                            : Colors.grey,
                      ),
                    ),

                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Weekly groceries',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.grey.shade700,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          '$_currencySymbol${_weeklyTotal?.toStringAsFixed(2) ?? '0.00'}',

                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 6),
                        _weeklyBudget != null
                            ? Text(
                                'Budget: $_currencySymbol${_weeklyBudget!.toStringAsFixed(2)}'
                                '${_weeklyTotal! <= _weeklyBudget! ? '  • Within budget' : '  • Over budget'}',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                  color: _weeklyTotal! <= _weeklyBudget!
                                      ? Colors.green
                                      : Colors.red,
                                ),
                              )
                            : const Text(
                                'Weekly total (budget not set)',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                  color: Colors.grey,
                                ),
                              ),
                        const SizedBox(height: 8),
                        const Text(
                          'Prices locked for this weekly plan',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey,
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                      ],
                    ),
                  ),

                // ----------------------------------------------------
                // PHASE 9.1 — Weekly grocery is frozen (visual trust)
                // ----------------------------------------------------
                Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.grey.shade300),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(
                        Icons.lock_outline,
                        size: 18,
                        color: Colors.grey,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'This grocery list is locked for this week.\n'
                          'It will update only if your meal plan changes.',
                          style: const TextStyle(
                            fontSize: 13,
                            color: Colors.black87,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // 🔎 Transparency note (UX honesty)
                const Padding(
                  padding: EdgeInsets.only(bottom: 12),
                  child: Text(
                    'Derived from your planned meals • Quantities may vary due to pack sizes',
                    style: TextStyle(fontSize: 13, color: Colors.grey),
                  ),
                ),

                ...orderedGroupedItems.entries.map((entry) {
                  final category = entry.key;
                  final items = entry.value;

                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        category.toUpperCase(),
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Colors.grey,
                        ),
                      ),
                      const SizedBox(height: 8),

                      ...items.map((item) {
                        final name = item['name'] ?? 'Item';
                        final displayText = '${item['grams']} ${item['unit']}';

                        final price =
                            item['estimatedCost'] ??
                            item['price'] ??
                            item['estimatedPrice'];

                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      name,
                                      style: const TextStyle(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      formatQuantity(item['grams'] ?? 0),
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w700,
                                        color: Colors.black87,
                                      ),
                                    ),

                                    // ----------------------------------------------------
                                    // PHASE 8.6.2 — Waste visibility (read-only)
                                    // ----------------------------------------------------
                                    if (item['packs'] != null)
                                      Padding(
                                        padding: const EdgeInsets.only(top: 4),
                                        child: Text(
                                          'Buy: ${item['packs']['packCount']} × ${item['packs']['packSize']}'
                                          '${item['unit'] ?? ''} • Waste ~'
                                          '${(item['packs']['waste'] * 1000).toStringAsFixed(0)} g',
                                          style: const TextStyle(
                                            fontSize: 12,
                                            color: Colors.grey,
                                          ),
                                        ),
                                      ),
                                    // PHASE 9.2 — Pack transparency label (trust)
                                    const Padding(
                                      padding: EdgeInsets.only(top: 2),
                                      child: Text(
                                        'Pack-based purchase • exact quantity may vary',
                                        style: TextStyle(
                                          fontSize: 11,
                                          color: Colors.grey,
                                          fontStyle: FontStyle.italic,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),

                              if (price != null)
                                Text(
                                  '€${price.toStringAsFixed(2)}',
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.grey,
                                  ),
                                ),
                            ],
                          ),
                        );
                      }),

                      const SizedBox(height: 24),
                    ],
                  );
                }),
              ],
            ),
    );
  }
}

/// UI-only helper — SAFE, PURE, NO SIDE EFFECTS
String resolveGroceryCategory(String name) {
  final n = name.toLowerCase();

  if ([
    'banana',
    'apple',
    'broccoli',
    'green beans',
    'potato',
  ].any(n.contains)) {
    return 'Produce';
  }

  if (['chicken', 'salmon', 'beef', 'fish'].any(n.contains)) {
    return 'Meat & Fish';
  }

  if (['milk', 'yogurt', 'cheese', 'egg'].any(n.contains)) {
    return 'Dairy & Eggs';
  }

  if ([
    'rolled oats',
    'oats',
    'almonds',
    'peanut butter',
    'rice',
    'cinnamon',
  ].any(n.contains)) {
    return 'Pantry';
  }

  if (['olive oil'].any(n.contains)) {
    return 'Oils & Condiments';
  }

  return 'Other';
}

String formatQuantity(num grams) {
  if (grams >= 1000) {
    final kg = grams / 1000;
    return '${kg.toStringAsFixed(2)} kg';
  }
  return '${grams.toStringAsFixed(0)} g';
}
