import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.smoke200,
      appBar: AppBar(
        title: const Text('EnStore Dashboard'),
        backgroundColor: AppColors.brand500,
        foregroundColor: AppColors.smoke200,
      ),
      body: const Center(
        child: Text(
          'Selamat Datang di EnStore!',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: AppColors.brand500,
          ),
        ),
      ),
    );
  }
}
