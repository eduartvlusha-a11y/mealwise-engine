import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mealwise_app/features/home/home_provider.dart';
import 'package:mealwise_app/core/services/api_service.dart';

class AiExplanationScreen extends StatefulWidget {
  const AiExplanationScreen({super.key});

  @override
  State<AiExplanationScreen> createState() => _AiExplanationScreenState();
}

class _AiExplanationScreenState extends State<AiExplanationScreen> {
  bool _loadingAi = false;
  String? _aiText;
  String? _aiError;

  @override
  void initState() {
    super.initState();
    // Try to fetch once on screen open
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchAiReasoning();
    });
  }

  Future<void> _fetchAiReasoning() async {
    final homeState = context.read<HomeProvider>().state;
    final home = homeState.data;

    final Map<String, dynamic>? weekPlan =
        home?['weekPlan'] as Map<String, dynamic>?;
    final Map<String, dynamic>? metrics =
        home?['metrics'] as Map<String, dynamic>?;

    if (weekPlan == null || metrics == null) {
      setState(() {
        _aiError = 'No active plan found.';
        _aiText = null;
        _loadingAi = false;
      });
      return;
    }

    // If backend already injected aiReasoningText into weekPlan, use it immediately
    final existingAi = weekPlan['aiReasoningText'] as String?;
    if (existingAi != null && existingAi.trim().isNotEmpty) {
      setState(() {
        _aiText = existingAi.trim();
        _aiError = null;
        _loadingAi = false;
      });
      return;
    }

    setState(() {
      _loadingAi = true;
      _aiError = null;
    });

    try {
      final api = context.read<ApiService>();

      // ✅ Buyer-grade behavior:
      // - AI text is fetched from backend (OpenAI)
      // - No local fallback sentences
      // Backend should return: { reasoningText: "..." }
      final res = await api.get('/ai/weekly-plan-reasoning');

      final data = res.data;
      final text = (data is Map<String, dynamic>)
          ? data['reasoningText'] as String?
          : null;

      setState(() {
        _aiText = (text ?? '').trim();
        _aiError = (_aiText == null || _aiText!.isEmpty)
            ? 'AI reasoning is empty. Check OpenAI key / backend logs.'
            : null;
        _loadingAi = false;
      });
    } catch (e) {
      setState(() {
        _aiError = 'Failed to load AI reasoning. Tap Retry.';
        _aiText = null;
        _loadingAi = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final homeState = context.watch<HomeProvider>().state;
    final home = homeState.data;

    final Map<String, dynamic>? weekPlan =
        home?['weekPlan'] as Map<String, dynamic>?;
    final Map<String, dynamic>? metrics =
        home?['metrics'] as Map<String, dynamic>?;

    if (weekPlan == null || metrics == null) {
      return const Scaffold(
        body: Center(child: Text('No active plan explanation available')),
      );
    }

    final weekStart = weekPlan['weekStart']?.toString() ?? '';
    final weekEnd = weekPlan['weekEnd']?.toString() ?? '';

    final weeklyBudget = (metrics['weeklyBudget'] as num?)?.toInt() ?? 0;
    final tdee = (metrics['maintenanceCalories'] as num?)?.toInt() ?? 0;
    final dailyTarget = (metrics['dailyCaloriesTarget'] as num?)?.toInt() ?? 0;
    final proteinTarget = (metrics['dailyProteinTarget'] as num?)?.toInt() ?? 0;

    return Scaffold(
      appBar: AppBar(title: const Text('Plan Explanation')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // =========================
              // SECTION A — HEADER (REAL SNAPSHOT)
              // =========================
              const Text(
                'Weekly Plan Explanation',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text('Week: $weekStart → $weekEnd'),
              Text('Weekly Budget: €$weeklyBudget'),
              const Divider(),

              // =========================
              // SECTION B — CORE METRICS (LOCKED TRUTH)
              // =========================
              const Text(
                'Your Fixed Nutrition Baseline',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              _MetricRow(
                label: 'Maintenance Calories (TDEE)',
                value: '$tdee kcal',
              ),
              _MetricRow(
                label: 'Daily Calories Target',
                value: '$dailyTarget kcal',
              ),
              _MetricRow(
                label: 'Daily Protein Target',
                value: '$proteinTarget g',
              ),
              const Divider(),

              // =========================
              // SECTION C — AI SYSTEM REASONING (REAL AI)
              // =========================
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'AI System Reasoning',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        _loadingAi ? 'Thinking…' : 'Live',
                        style: TextStyle(
                          fontSize: 12,
                          color: _loadingAi ? Colors.orange : Colors.green,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),

                  TextButton.icon(
                    onPressed: _loadingAi ? null : _fetchAiReasoning,
                    icon: const Icon(Icons.refresh, size: 18),
                    label: const Text('Retry'),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              if (_loadingAi)
                const _AiLoadingCard()
              else if (_aiError != null)
                _AiErrorCard(message: _aiError!)
              else if (_aiText != null && _aiText!.isNotEmpty)
                _AiReasoningCard(text: _aiText!)
              else
                const _AiEmptyCard(),

              const SizedBox(height: 12),

              const _LockNotice(),
            ],
          ),
        ),
      ),
    );
  }
}

/* =========================
   UI COMPONENTS
========================= */

class _MetricRow extends StatelessWidget {
  final String label;
  final String value;

  const _MetricRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(child: Text(label)),
          Row(
            children: [
              Text(value),
              const SizedBox(width: 6),
              const Icon(Icons.lock, size: 14),
            ],
          ),
        ],
      ),
    );
  }
}

class _AiLoadingCard extends StatelessWidget {
  const _AiLoadingCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.black12),
      ),
      child: const Row(
        children: [
          SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(strokeWidth: 2),
          ),
          SizedBox(width: 10),
          Expanded(
            child: Text(
              'Generating AI reasoning…',
              style: TextStyle(color: Colors.grey),
            ),
          ),
        ],
      ),
    );
  }
}

class _AiErrorCard extends StatelessWidget {
  final String message;
  const _AiErrorCard({required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.black12),
      ),
      child: Text(
        'AI insight temporarily unavailable.\nTap Retry to regenerate.',
        style: const TextStyle(color: Colors.red, height: 1.4),
      ),
    );
  }
}

class _AiEmptyCard extends StatelessWidget {
  const _AiEmptyCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.black12),
      ),
      child: const Text(
        'No AI insight generated yet.\nTap Retry to generate a fresh explanation.',

        style: TextStyle(color: Colors.grey),
      ),
    );
  }
}

class _AiReasoningCard extends StatelessWidget {
  final String text;
  const _AiReasoningCard({required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.black12),
      ),
      child: Text(text, style: const TextStyle(fontSize: 14, height: 1.4)),
    );
  }
}

class _LockNotice extends StatelessWidget {
  const _LockNotice();

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.only(top: 8),
      child: Text(
        'This AI explanation interprets a frozen weekly plan.\n'
        'Calories, macros, diet rules, and budget are never changed by AI.',

        style: TextStyle(fontSize: 12, color: Colors.grey),
      ),
    );
  }
}
