import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mealwise_app/core/services/onboarding_service.dart';
import 'package:flutter/services.dart';

class OnboardingStep1Personal extends StatefulWidget {
  const OnboardingStep1Personal({super.key});

  @override
  State<OnboardingStep1Personal> createState() =>
      _OnboardingStep1PersonalState();
}

class _OnboardingStep1PersonalState extends State<OnboardingStep1Personal> {
  final heightController = TextEditingController();
  final weightController = TextEditingController();
  final ageController = TextEditingController();

  String gender = "male";
  String bodyType = "average";
  bool trainsRegularly = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Your Body Data")),
      body: SafeArea(
        child: SingleChildScrollView(
          keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("Height", style: TextStyle(fontSize: 16)),
              TextField(
                controller: heightController,
                keyboardType: TextInputType.number,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                decoration: const InputDecoration(
                  hintText: "e.g. 180",
                  suffixText: "cm",
                  border: OutlineInputBorder(),
                ),
              ),

              const SizedBox(height: 20),

              const Text("Weight", style: TextStyle(fontSize: 16)),
              TextField(
                controller: weightController,
                keyboardType: TextInputType.number,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                decoration: const InputDecoration(
                  hintText: "e.g. 75",
                  suffixText: "kg",
                  border: OutlineInputBorder(),
                ),
              ),

              const SizedBox(height: 20),

              const Text("Age", style: TextStyle(fontSize: 16)),
              TextField(
                controller: ageController,
                keyboardType: TextInputType.number,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                decoration: const InputDecoration(
                  hintText: "e.g. 30",
                  suffixText: "years",
                  border: OutlineInputBorder(),
                ),
              ),

              const SizedBox(height: 20),

              const Text("Gender", style: TextStyle(fontSize: 16)),
              Row(
                children: [
                  Radio<String>(
                    value: "male",
                    groupValue: gender,
                    onChanged: (value) {
                      setState(() => gender = value!);
                    },
                  ),
                  const Text("Male"),
                  Radio<String>(
                    value: "female",
                    groupValue: gender,
                    onChanged: (value) {
                      setState(() => gender = value!);
                    },
                  ),
                  const Text("Female"),
                ],
              ),

              const SizedBox(height: 32),

              const Text(
                "Body Type",
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),

              GestureDetector(
                onTap: () => setState(() => bodyType = "slim"),
                child: _bodyTypeBox("Slim", bodyType == "slim"),
              ),
              GestureDetector(
                onTap: () => setState(() => bodyType = "average"),
                child: _bodyTypeBox("Average", bodyType == "average"),
              ),
              GestureDetector(
                onTap: () => setState(() => bodyType = "athletic"),
                child: _bodyTypeBox("Athletic", bodyType == "athletic"),
              ),
              GestureDetector(
                onTap: () => setState(() => bodyType = "heavy"),
                child: _bodyTypeBox("Heavy-set", bodyType == "heavy"),
              ),

              const SizedBox(height: 24),

              SwitchListTile(
                value: trainsRegularly,
                onChanged: (v) => setState(() => trainsRegularly = v),
                title: const Text(
                  "I train regularly (3+ times per week)",
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
              ),

              const SizedBox(height: 32),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    final int? h = int.tryParse(heightController.text);
                    final int? w = int.tryParse(weightController.text);
                    final int? a = int.tryParse(ageController.text);

                    if (h == null || w == null || a == null) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text("Enter valid numeric values"),
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                      return;
                    }

                    if (h < 120 ||
                        h > 230 ||
                        w < 35 ||
                        w > 250 ||
                        a < 10 ||
                        a > 100) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text("Values look unrealistic"),
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                      return;
                    }

                    final onboarding = context.read<OnboardingService>();

                    onboarding.saveStep1(
                      h: h.toString(),
                      w: w.toString(),
                      a: a.toString(),
                      g: gender,
                      bodyType: bodyType,
                      trainsRegularly: trainsRegularly,
                    );

                    Navigator.pushNamed(context, '/onboarding/step2');
                  },
                  child: const Text("Next → Goals"),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _bodyTypeBox(String label, bool selected) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: selected ? Colors.deepPurple : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: selected ? Colors.deepPurple : Colors.grey.shade300,
          width: 2,
        ),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: selected ? Colors.white : Colors.black87,
        ),
      ),
    );
  }

  @override
  void dispose() {
    heightController.dispose();
    weightController.dispose();
    ageController.dispose();
    super.dispose();
  }
}
