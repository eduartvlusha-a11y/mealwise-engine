import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mealwise_app/core/services/onboarding_service.dart';
import 'package:mealwise_app/features/results/results_screen.dart';
import 'package:mealwise_app/features/results/results_service.dart';

class OnboardingStep4Budget extends StatefulWidget {
  const OnboardingStep4Budget({super.key});

  @override
  State<OnboardingStep4Budget> createState() => _OnboardingStep4BudgetState();
}

class _OnboardingStep4BudgetState extends State<OnboardingStep4Budget> {
  final budgetController = TextEditingController();
  String selectedCurrency = "EUR";

  final currencies = ["EUR", "USD", "GBP", "AUD", "CAD"];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Your Budget")),

      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "Weekly Grocery Budget",
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),

              TextField(
                controller: budgetController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: "Budget (e.g. 50)",
                  border: OutlineInputBorder(),
                ),
              ),

              const SizedBox(height: 24),

              const Text(
                "Select Currency",
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),

              DropdownButtonFormField<String>(
                initialValue: selectedCurrency,
                decoration: const InputDecoration(border: OutlineInputBorder()),
                items: currencies
                    .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                    .toList(),
                onChanged: (value) {
                  setState(() => selectedCurrency = value!);
                },
              ),

              const SizedBox(height: 32),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () async {
                    final double? budget = double.tryParse(
                      budgetController.text.trim(),
                    );

                    if (budget == null) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text("Enter a valid budget number."),
                        ),
                      );
                      return;
                    }

                    if (budget <= 0 || budget > 1000) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text("Budget looks unrealistic."),
                        ),
                      );
                      return;
                    }

                    final onb = context.read<OnboardingService>();

                    // STEP 4 — save to provider (sync)
                    onb.saveStep4(
                      userBudget: budget.toString(),
                      userCurrency: selectedCurrency,
                    );

                    // FINAL SUBMIT
                    final success = await onb.submitOnboarding();

                    if (!mounted) return;

                    if (!success) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text("Failed to save onboarding."),
                        ),
                      );
                      return;
                    }

                    final resultsService = ResultsService();
                    final rawResults = await resultsService.fetchResults();
                    final results = Map<String, dynamic>.from(rawResults);

                    print('📦 RAW RESULTS JSON => $results');

                    if (!mounted) return;

                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                        builder: (_) => ResultsScreen(results: results),
                      ),
                    );
                  },

                  child: const Text("Finish → Home"),
                ),
              ),

              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    budgetController.dispose();
    super.dispose();
  }
}
