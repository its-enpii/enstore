import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../main/main_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    // Wait for a bit for the splash animation feel
    await Future.delayed(const Duration(seconds: 2));

    if (mounted) {
      // Navigate to dashboard/main screen regardless of login status
      Navigator.of(
        context,
      ).pushReplacement(MaterialPageRoute(builder: (_) => const MainScreen()));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.smoke200,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Placeholder for logo
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: AppColors.ocean500,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.ocean500.withOpacity(0.3),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: const Icon(
                Icons.shopping_bag_rounded,
                size: 50,
                color: AppColors.smoke200,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'ENSTORE',
              style: TextStyle(
                color: AppColors.brand500.withValues(alpha: 0.9),
                fontSize: 24,
                fontWeight: FontWeight.bold,
                letterSpacing: 4,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Premium Game Store',
              style: TextStyle(
                color: AppColors.brand500.withValues(alpha: 0.4),
                fontSize: 12,
                letterSpacing: 1,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
