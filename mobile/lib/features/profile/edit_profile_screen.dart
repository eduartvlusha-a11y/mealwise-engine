import 'package:flutter/material.dart';

class EditProfileScreen extends StatefulWidget {
  final Map<String, dynamic> profile;

  const EditProfileScreen({super.key, required this.profile});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  late TextEditingController _weightController;
  late TextEditingController _dietController;
  late TextEditingController _allergiesController;
  late TextEditingController _weeklyBudgetController;
  late TextEditingController _goalController;
  late TextEditingController _activityLevelController;

  @override
  void initState() {
    super.initState();
    _weightController = TextEditingController(
      text: widget.profile['weight']?.toString() ?? '',
    );
    _dietController = TextEditingController(
      text: widget.profile['diet']?.toString() ?? '',
    );

    _allergiesController = TextEditingController(
      text: (widget.profile['allergies'] as List?)?.join(', ') ?? '',
    );

    _weeklyBudgetController = TextEditingController(
      text: widget.profile['weeklyBudget']?.toString() ?? '',
    );

    _goalController = TextEditingController(
      text: widget.profile['goal']?.toString() ?? '',
    );

    _activityLevelController = TextEditingController(
      text: widget.profile['activityLevel']?.toString() ?? '',
    );
  }

  @override
  void dispose() {
    _weightController.dispose();
    _dietController.dispose();
    _allergiesController.dispose();
    _weeklyBudgetController.dispose();
    _goalController.dispose();
    _activityLevelController.dispose();

    super.dispose();
  }

  Widget row(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 140,
            child: Text(
              label,
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                color: Colors.grey,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }

  Widget editableWeightRow() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const SizedBox(
            width: 140,
            child: Text(
              'Weight',
              style: TextStyle(fontWeight: FontWeight.w600, color: Colors.grey),
            ),
          ),
          Expanded(
            child: TextField(
              controller: _weightController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                suffixText: 'kg',
                isDense: true,
                border: OutlineInputBorder(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final profile = widget.profile;

    return Scaffold(
      appBar: AppBar(title: const Text('Edit Profile')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: ListView(
          children: [
            const Text(
              'Review your profile data',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 24),

            row('Age', '${profile['age'] ?? '-'}'),
            row('Gender', '${profile['gender'] ?? '-'}'),
            row('Height', '${profile['height'] ?? '-'} cm'),
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(
                    width: 140,
                    child: Text(
                      'Activity Level',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: Colors.grey,
                      ),
                    ),
                  ),
                  Expanded(
                    child: TextField(
                      controller: _activityLevelController,
                      decoration: const InputDecoration(
                        hintText:
                            'sedentary | light | moderate | active | very_active',
                        isDense: true,
                        border: OutlineInputBorder(),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // ✅ ONLY THIS FIELD IS EDITABLE (MOVE 4)
            editableWeightRow(),

            const Divider(height: 32),

            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(
                    width: 140,
                    child: Text(
                      'Goal',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: Colors.grey,
                      ),
                    ),
                  ),
                  Expanded(
                    child: TextField(
                      controller: _goalController,
                      decoration: const InputDecoration(
                        hintText: 'weight_loss | maintain | weight_gain',
                        isDense: true,
                        border: OutlineInputBorder(),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(
                    width: 140,
                    child: Text(
                      'Diet',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: Colors.grey,
                      ),
                    ),
                  ),
                  Expanded(
                    child: TextField(
                      controller: _dietController,
                      decoration: const InputDecoration(
                        hintText: 'e.g. vegan, halal',
                        isDense: true,
                        border: OutlineInputBorder(),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(
                    width: 140,
                    child: Text(
                      'Allergies',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: Colors.grey,
                      ),
                    ),
                  ),
                  Expanded(
                    child: TextField(
                      controller: _allergiesController,
                      decoration: const InputDecoration(
                        hintText: 'comma separated',
                        isDense: true,
                        border: OutlineInputBorder(),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const Divider(height: 32),

            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(
                    width: 140,
                    child: Text(
                      'Weekly Budget',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: Colors.grey,
                      ),
                    ),
                  ),
                  Expanded(
                    child: TextField(
                      controller: _weeklyBudgetController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        suffixText: '€',
                        isDense: true,
                        border: OutlineInputBorder(),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () async {
                  final newWeight = int.tryParse(_weightController.text);
                  if (newWeight == null) return;

                  final newBudget = int.tryParse(_weeklyBudgetController.text);

                  final allergies = _allergiesController.text
                      .split(',')
                      .map((e) => e.trim())
                      .where((e) => e.isNotEmpty)
                      .toList();

                  Navigator.pop(context, {
                    'weight': newWeight,
                    'dietaryPreferences': _dietController.text.isNotEmpty
                        ? [_dietController.text.trim()]
                        : [],
                    'allergies': allergies,
                    'budget': newBudget,

                    'goal': _goalController.text.trim().isEmpty
                        ? null
                        : _goalController.text.trim(),

                    'activityLevel':
                        _activityLevelController.text.trim().isEmpty
                        ? null
                        : _activityLevelController.text.trim(),
                  });
                },

                child: const Text('Save'),
              ),
            ),

            const Text(
              'Editing is enabled only for Weight (for now).',
              style: TextStyle(color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }
}
