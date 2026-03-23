import 'package:flutter/material.dart';
import 'package:mealwise_app/features/home/home_screen.dart';
import 'package:mealwise_app/features/grocery/weekly_grocery_screen.dart';
import 'package:mealwise_app/features/planner/planner_screen.dart';
import 'package:mealwise_app/features/profile/profile_screen.dart';
import 'package:mealwise_app/features/ai_explanation/ai_explanation_screen.dart';

// TODO: Add grocery, AI, profile screens later

class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _selectedIndex = 0;

  final _screens = [
    const HomeScreen(), // 0
    const PlannerScreen(), // 1
    const WeeklyGroceryScreen(), // 2
    const AiExplanationScreen(), // 3 AI
    const ProfileScreen(), // 4 Profile
  ];

  void _changeTab(int index) {
    setState(() => _selectedIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_selectedIndex],

      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _selectedIndex,
        onTap: _changeTab,
        selectedItemColor: Colors.black,
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: "Home"),
          BottomNavigationBarItem(
            icon: Icon(Icons.calendar_today),
            label: "Planner",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.shopping_cart),
            label: "Grocery",
          ),
          BottomNavigationBarItem(icon: Icon(Icons.bolt), label: "AI"),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: "Profile"),
        ],
      ),
    );
  }
}
