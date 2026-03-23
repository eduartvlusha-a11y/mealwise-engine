import 'package:flutter/material.dart';
import 'onboarding_step1_personal.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F8FB),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        title: const Text(
          "MealWise",
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 20),

            // -----------------------------
            // TITLE
            // -----------------------------
            const Text(
              "Let’s personalize your nutrition",
              style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
            ),

            const SizedBox(height: 12),

            const Text(
              "MealWise works best when it understands your goals. "
              "Answer a few quick questions and we’ll do the thinking for you.",
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),

            const SizedBox(height: 32),

            // -----------------------------
            // BULLET 1
            // -----------------------------
            _bullet(
              icon: Icons.flag,
              title: "Your goal",
              subtitle: "Lose weight, maintain, or gain muscle",
            ),

            const SizedBox(height: 16),

            // -----------------------------
            // BULLET 2
            // -----------------------------
            _bullet(
              icon: Icons.local_fire_department,
              title: "Calories & protein",
              subtitle: "Set targets that fit your lifestyle",
            ),

            const SizedBox(height: 16),

            // -----------------------------
            // BULLET 3
            // -----------------------------
            _bullet(
              icon: Icons.account_balance_wallet,
              title: "Smart budget",
              subtitle: "Eat well without overspending",
            ),

            const Spacer(),

            // -----------------------------
            // START BUTTON
            // -----------------------------
            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const OnboardingStep1Personal(),
                    ),
                  );
                },

                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4CAF50),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                child: const Text(
                  "Start",
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  // -----------------------------
  // BULLET WIDGET
  // -----------------------------
  static Widget _bullet({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 28, color: Colors.green),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: const TextStyle(fontSize: 14, color: Colors.grey),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
