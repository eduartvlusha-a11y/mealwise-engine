import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mealwise_app/core/services/onboarding_service.dart';

class OnboardingStep3Nutrition extends StatefulWidget {
  const OnboardingStep3Nutrition({super.key});

  @override
  State<OnboardingStep3Nutrition> createState() =>
      _OnboardingStep3NutritionState();
}

class _OnboardingStep3NutritionState extends State<OnboardingStep3Nutrition> {
  String selectedDiet = "none"; // default = no restriction

  final List<String> allergies = [];
  final List<String> allergyOptions = [
    "nuts",
    "gluten",
    "dairy",
    "eggs",
    "shellfish",
    "soy",
  ];

  Widget buildDietCard({required String title, required String value}) {
    final bool isSelected = value == selectedDiet;

    return GestureDetector(
      onTap: () => setState(() => selectedDiet = value),
      child: Container(
        padding: const EdgeInsets.all(16),
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          color: isSelected ? Colors.deepPurple : Colors.white,
          border: Border.all(
            color: isSelected ? Colors.deepPurple : Colors.grey.shade300,
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

  Widget buildAllergyChip(String allergy) {
    final bool isSelected = allergies.contains(allergy);

    return GestureDetector(
      onTap: () {
        setState(() {
          if (isSelected) {
            allergies.remove(allergy);
          } else {
            allergies.add(allergy);
          }
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
        margin: const EdgeInsets.only(right: 8, bottom: 8),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          color: isSelected ? Colors.deepPurple : Colors.grey.shade200,
        ),
        child: Text(
          allergy.toUpperCase(),
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.black87,
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
          "MealWise",
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // -----------------------------
              // TITLE
              // -----------------------------
              const Text(
                "Nutrition preferences",
                style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
              ),

              const SizedBox(height: 12),

              const Text(
                "Tell us how you prefer to eat so MealWise can plan better meals for you.",
                style: TextStyle(fontSize: 16, color: Colors.grey),
              ),

              const SizedBox(height: 32),

              // -----------------------------
              // DIET SECTION
              // -----------------------------
              const Text(
                "Diet preference",
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),

              const SizedBox(height: 16),

              buildDietCard(title: "No Preference", value: "none"),
              buildDietCard(title: "Vegetarian", value: "vegetarian"),
              buildDietCard(title: "Vegan", value: "vegan"),
              buildDietCard(title: "Keto", value: "keto"),
              buildDietCard(title: "Paleo", value: "paleo"),
              buildDietCard(title: "High Protein", value: "high_protein"),

              const SizedBox(height: 32),

              // -----------------------------
              // ALLERGIES SECTION
              // -----------------------------
              const Text(
                "Allergies",
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),

              const SizedBox(height: 12),

              Wrap(
                children: allergyOptions
                    .map((a) => buildAllergyChip(a))
                    .toList(),
              ),

              const SizedBox(height: 40),

              // -----------------------------
              // NEXT BUTTON
              // -----------------------------
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed: () {
                    final onb = context.read<OnboardingService>();

                    onb.saveStep3(
                      selectedDiet: selectedDiet.trim().toLowerCase(),
                      selectedAllergies: List<String>.from(allergies),
                    );

                    Navigator.pushNamed(context, '/onboarding/step4');
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF4CAF50),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: const Text(
                    "Next → Budget",
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
      ),
    );
  }
}
