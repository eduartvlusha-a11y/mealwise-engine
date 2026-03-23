import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mealwise_app/core/services/api_service.dart';
import 'package:mealwise_app/features/profile/edit_profile_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _loading = true;
  Map<String, dynamic>? _profile;
  Map<String, dynamic>? _metrics;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    try {
      final api = context.read<ApiService>();
      final res = await api.get('/profile');

      setState(() {
        _profile = res.data['profile'];
        _metrics = res.data['metrics'];
        _loading = false;
      });
    } catch (_) {
      setState(() {
        _loading = false;
      });
    }
  }

  Widget row(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
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

  @override
  Widget build(BuildContext context) {
    debugPrint('PROFILE SCREEN BUILD');

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _profile == null
          ? const Center(child: Text('Profile not available'))
          : Column(
              children: [
                // 🔹 Scrollable profile content
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      row('Age', '${_profile!['age'] ?? '-'}'),
                      row('Gender', '${_profile!['gender'] ?? '-'}'),
                      row('Height', '${_profile!['height'] ?? '-'} cm'),
                      row('Weight', '${_profile!['weight'] ?? '-'} kg'),
                      const Divider(height: 32),

                      row('Goal', '${_profile!['goal'] ?? '-'}'),
                      row(
                        'Activity Level',
                        '${_profile!['activityLevel'] ?? '-'}',
                      ),
                      row('BMR', '${_metrics?['bmr'] ?? '-'}'),
                      row('TDEE', '${_metrics?['tdee'] ?? '-'}'),
                      row(
                        'Daily Calories',
                        '${_metrics?['dailyCaloriesTarget'] ?? '-'}',
                      ),
                      row(
                        'Daily Protein',
                        _metrics?['dailyProteinTarget'] != null
                            ? '${_metrics!['dailyProteinTarget']} g'
                            : '-',
                      ),
                      const Divider(height: 32),

                      row('Diet', _profile!['diet'] ?? '-'),
                      row(
                        'Allergies',
                        (_profile!['allergies'] as List?)?.join(', ') ?? '-',
                      ),
                      const Divider(height: 32),

                      row(
                        'Weekly Budget',
                        _profile!['weeklyBudget'] != null
                            ? '${_profile!['weeklyBudget']}'
                            : '-',
                      ),
                    ],
                  ),
                ),

                // 🔹 FIXED bottom buttons
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () async {
                            final result = await Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) =>
                                    EditProfileScreen(profile: _profile!),
                              ),
                            );

                            if (result != null) {
                              final api = context.read<ApiService>();

                              await api.patch('/profile', data: result);

                              _loadProfile();
                            }
                          },
                          child: const Text('Edit Profile'),
                        ),
                      ),

                      const SizedBox(height: 12),

                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton(
                          onPressed: () async {
                            try {
                              final api = context.read<ApiService>();
                              final res = await api.post('/payments/subscribe');

                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    'Upgrade status: ${res.data['status']} (${res.data['provider']})',
                                  ),
                                ),
                              );
                            } catch (_) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text(
                                    'Upgrade failed. Please try again.',
                                  ),
                                ),
                              );
                            }
                          },
                          child: const Text('Upgrade to Pro'),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}
