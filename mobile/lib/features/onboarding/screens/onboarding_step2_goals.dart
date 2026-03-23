import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mealwise_app/core/services/onboarding_service.dart';

class OnboardingStep2Goals extends StatefulWidget {
  const OnboardingStep2Goals({super.key});

  @override
  State<OnboardingStep2Goals> createState() => _OnboardingStep2GoalsState();
}

class _OnboardingStep2GoalsState extends State<OnboardingStep2Goals> {
  String selectedGoal = "";
  String selectedActivity = "";

  Widget buildCard({
    required String title,
    required String value,
    required String groupValue,
    required Function(String) onSelect,
  }) {
    final bool isSelected = value == groupValue;

    return GestureDetector(
      onTap: () => onSelect(value),
      child: Container(
        padding: const EdgeInsets.all(18),
        margin: const EdgeInsets.only(bottom: 14),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(18),
          color: isSelected ? const Color(0xFF4CAF50) : Colors.white,
          boxShadow: [
            if (isSelected)
              const BoxShadow(
                color: Color(0x334CAF50),
                blurRadius: 14,
                offset: Offset(0, 6),
              ),
          ],
          border: Border.all(
            color: isSelected ? const Color(0xFF4CAF50) : Colors.grey.shade300,
            width: 2,
          ),
        ),
        child: Text(
          title,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.black87,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F8FB),

      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        title: const Text(
          "Your Goals",
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
        ),
        iconTheme: const IconThemeData(color: Colors.black),
      ),

      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ------------ Goal Section ------------
              const Text(
                "Select your goal",
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),

              buildCard(
                title: "Lose Weight",
                value: "lose",
                groupValue: selectedGoal,
                onSelect: (v) => setState(() => selectedGoal = v),
              ),
              buildCard(
                title: "Maintain Weight",
                value: "maintain",
                groupValue: selectedGoal,
                onSelect: (v) => setState(() => selectedGoal = v),
              ),
              buildCard(
                title: "Gain Weight",
                value: "gain",
                groupValue: selectedGoal,
                onSelect: (v) => setState(() => selectedGoal = v),
              ),

              const SizedBox(height: 32),

              // ------------ Activity Section ------------
              const Text(
                "Activity Level",
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),

              buildCard(
                title: "Sedentary",
                value: "sedentary",
                groupValue: selectedActivity,
                onSelect: (v) => setState(() => selectedActivity = v),
              ),
              buildCard(
                title: "Light",
                value: "light",
                groupValue: selectedActivity,
                onSelect: (v) => setState(() => selectedActivity = v),
              ),
              buildCard(
                title: "Moderate",
                value: "moderate",
                groupValue: selectedActivity,
                onSelect: (v) => setState(() => selectedActivity = v),
              ),
              buildCard(
                title: "Active",
                value: "active",
                groupValue: selectedActivity,
                onSelect: (v) => setState(() => selectedActivity = v),
              ),
              buildCard(
                title: "Very Active",
                value: "very_active",
                groupValue: selectedActivity,
                onSelect: (v) => setState(() => selectedActivity = v),
              ),

              const SizedBox(height: 32),

              // NEXT BUTTON
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed: () {
                    if (selectedGoal.isEmpty || selectedActivity.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text("Please select goal and activity"),
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                      return;
                    }

                    final onb = context.read<OnboardingService>();

                    onb.saveStep2(
                      userGoal: selectedGoal.trim().toLowerCase(),
                      userActivity: selectedActivity.trim().toLowerCase(),
                    );

                    Navigator.pushNamed(context, '/onboarding/step3');
                  },

                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF4CAF50),
                    disabledBackgroundColor: Colors.grey.shade300,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: const Text(
                    "Next → Nutrition",
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
