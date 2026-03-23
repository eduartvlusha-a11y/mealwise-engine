import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mealwise_app/features/home/home_provider.dart';

class ResultsScreen extends StatelessWidget {
  static const routeName = '/results';

  final Map<String, dynamic> results;

  ResultsScreen({super.key, required Map results})
    : results = Map<String, dynamic>.from(results);

  @override
  Widget build(BuildContext context) {
    // 🔥 FIX: handle wrapped backend response
    final root = results['results'] is Map
        ? Map<String, dynamic>.from(results['results'] as Map)
        : results;

    final metrics = root['metrics'] is Map
        ? Map<String, dynamic>.from(root['metrics'] as Map)
        : <String, dynamic>{};

    final strategy = root['strategy'] is Map
        ? Map<String, dynamic>.from(root['strategy'] as Map)
        : <String, dynamic>{};

    final reasoning = root['reasoning'] is List
        ? List<String>.from(root['reasoning'] as List)
        : <String>[];

    return Scaffold(
      backgroundColor: const Color(0xFFF5F8FB),
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        title: const Text(
          'Your Nutrition Plan',
          style: TextStyle(
            color: Colors.black,
            fontWeight: FontWeight.w700,
            fontSize: 20,
          ),
        ),
        centerTitle: false,
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _SectionTitle(
              title: 'Core Metrics',
              subtitle: 'Objective physiological calculations',
            ),
            const SizedBox(height: 10),
            _MetricsCard(metrics: metrics),

            const SizedBox(height: 24),
            _SectionTitle(
              title: 'Strategy',
              subtitle: 'How the system structured your plan',
            ),
            const SizedBox(height: 10),
            _StrategyCard(strategy: strategy),

            const SizedBox(height: 24),
            _SectionTitle(
              title: 'Reasoning',
              subtitle: 'Why these decisions were made',
            ),
            const SizedBox(height: 10),
            _ReasoningCard(items: reasoning.map((e) => e.toString()).toList()),

            const SizedBox(height: 24),
            _RiskFlagsCard(
              riskFlags: (metrics['riskFlags'] ?? []) as List<dynamic>,
            ),

            const SizedBox(height: 36),
            SizedBox(
              height: 54,
              child: ElevatedButton(
                onPressed: () async {
                  try {
                    await context.read<HomeProvider>().startPlan();

                    Navigator.pushNamedAndRemoveUntil(
                      context,
                      '/home',
                      (route) => false,
                    );
                  } catch (e) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Failed to start plan')),
                    );
                  }
                },

                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: const Text(
                  'Start My Plan',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.2,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// UI COMPONENTS
// -----------------------------------------------------------------------------

class _SectionTitle extends StatelessWidget {
  final String title;
  final String subtitle;

  const _SectionTitle({required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: Theme.of(
            context,
          ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 4),
        Text(
          subtitle,
          style: Theme.of(
            context,
          ).textTheme.bodySmall?.copyWith(color: Colors.grey[600]),
        ),
      ],
    );
  }
}

// -----------------------------------------------------------------------------
// METRICS
// -----------------------------------------------------------------------------

class _MetricsCard extends StatelessWidget {
  final Map<String, dynamic> metrics;

  const _MetricsCard({required this.metrics});

  String _v(dynamic v) => v == null ? '—' : v.toString();

  @override
  Widget build(BuildContext context) {
    final items = [
      _Metric('BMR', _v(metrics['bmr'])),
      _Metric('TDEE', _v(metrics['tdee'])),
      _Metric('Daily Calories', _v(metrics['dailyCaloriesTarget'])),
      _Metric('Daily Protein', '${_v(metrics['dailyProteinTarget'])} g'),
      _Metric('Weekly Budget', _v(metrics['weeklyBudget'])),
      _Metric('Meal Count', _v(metrics['mealCountHint'])),
    ];

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Wrap(
          spacing: 12,
          runSpacing: 12,
          children: items.map((m) {
            return SizedBox(
              width:
                  (MediaQuery.of(context).size.width - 16 * 2 - 16 * 2 - 12) /
                  2,
              child: _MetricTile(label: m.label, value: m.value),
            );
          }).toList(),
        ),
      ),
    );
  }
}

class _Metric {
  final String label;
  final String value;
  _Metric(this.label, this.value);
}

class _MetricTile extends StatelessWidget {
  final String label;
  final String value;

  const _MetricTile({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Theme.of(context).dividerColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: Theme.of(context).textTheme.labelMedium),
          const SizedBox(height: 6),
          Text(
            value,
            style: Theme.of(
              context,
            ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
          ),
        ],
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// STRATEGY
// -----------------------------------------------------------------------------

class _StrategyCard extends StatelessWidget {
  final Map<String, dynamic> strategy;

  const _StrategyCard({required this.strategy});

  String _h(dynamic raw) {
    if (raw == null) return '—';
    return raw.toString().replaceAll('_', ' ');
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            _Row(label: 'Meal Structure', value: _h(strategy['mealStructure'])),
            const Divider(height: 24),
            _Row(label: 'Macro Focus', value: _h(strategy['macroFocus'])),
            const Divider(height: 24),
            _Row(label: 'Food Strategy', value: _h(strategy['foodStrategy'])),
          ],
        ),
      ),
    );
  }
}

class _Row extends StatelessWidget {
  final String label;
  final String value;

  const _Row({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(label, style: Theme.of(context).textTheme.bodyMedium),
        ),
        Text(
          value,
          style: Theme.of(
            context,
          ).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w700),
        ),
      ],
    );
  }
}

// -----------------------------------------------------------------------------
// REASONING
// -----------------------------------------------------------------------------

class _ReasoningCard extends StatelessWidget {
  final List<String> items;

  const _ReasoningCard({required this.items});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: items.isEmpty
            ? const Text('—')
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: items.map((r) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('•  '),
                        Expanded(child: Text(r)),
                      ],
                    ),
                  );
                }).toList(),
              ),
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// RISK FLAGS
// -----------------------------------------------------------------------------

class _RiskFlagsCard extends StatelessWidget {
  final List<dynamic> riskFlags;

  const _RiskFlagsCard({required this.riskFlags});

  @override
  Widget build(BuildContext context) {
    final flags = riskFlags.map((e) => e.toString()).toList();

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: flags.isEmpty
            ? Row(
                children: const [
                  Icon(Icons.verified_outlined),
                  SizedBox(width: 10),
                  Expanded(child: Text('No risk flags detected.')),
                ],
              )
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Risk Flags',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: flags.map((f) {
                      return Chip(label: Text(f));
                    }).toList(),
                  ),
                ],
              ),
      ),
    );
  }
}
