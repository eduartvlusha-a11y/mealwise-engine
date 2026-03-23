import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/services/auth_service.dart';
import 'core/services/onboarding_service.dart';

import 'features/auth/login/login_screen.dart';
import 'features/auth/register/register_screen.dart';

import 'features/startup/startup_loader.dart';
import 'theme/app_theme.dart';

import 'package:mealwise_app/features/onboarding/screens/onboarding_step1_personal.dart';
import 'package:mealwise_app/features/onboarding/screens/onboarding_step2_goals.dart';
import 'package:mealwise_app/features/onboarding/screens/onboarding_step3_nutrition.dart';
import 'package:mealwise_app/features/onboarding/screens/onboarding_step4_budget.dart';
import 'package:mealwise_app/features/home/home_shell.dart';
import 'features/home/home_provider.dart';
import 'core/services/plan_service.dart';
import 'package:mealwise_app/core/services/api_service.dart';

void main() {
  runApp(const MealWiseApp());
}

class MealWiseApp extends StatelessWidget {
  const MealWiseApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider(create: (_) => ApiService()),

        Provider<AuthService>(create: (_) => AuthService()),

        Provider<PlanService>(create: (_) => PlanService()),

        ChangeNotifierProvider(create: (_) => OnboardingService()),

        ChangeNotifierProvider(create: (_) => HomeProvider()),
      ],

      child: MaterialApp(
        title: 'MealWise',
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.system,
        debugShowCheckedModeBanner: false,

        initialRoute: '/startup',

        routes: {
          '/startup': (_) => const StartupLoader(),
          '/login': (_) => const LoginScreen(),
          '/register': (_) => const RegisterScreen(),

          '/home': (_) => const HomeShell(),

          // Onboarding
          '/onboarding': (_) => const OnboardingStep1Personal(),
          '/onboarding/step2': (_) => const OnboardingStep2Goals(),
          '/onboarding/step3': (_) => const OnboardingStep3Nutrition(),
          '/onboarding/step4': (_) => const OnboardingStep4Budget(),
        },
      ),
    );
  }
}
