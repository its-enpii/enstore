import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import 'home_screen.dart';
import '../auth/login_screen.dart';
import '../profile/profile_screen.dart';
import '../../../core/services/auth_service.dart';
import '../../../core/network/api_client.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;
  bool _isLoggedIn = false;

  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final apiClient = ApiClient();
    final authService = AuthService(apiClient);
    final status = await authService.isLoggedIn();
    if (mounted) {
      setState(() => _isLoggedIn = status);
    }
  }

  List<Widget> get _screens => [
    const HomeScreen(),
    const Center(child: Text('Promo Screen')), // Placeholder
    const Center(child: Text('Favorites Screen')), // Placeholder
    const Center(child: Text('Orders Screen')), // Placeholder
    _isLoggedIn ? const ProfileScreen() : const LoginScreen(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  Widget _buildNavItem(int index, IconData icon) {
    final isSelected = _selectedIndex == index;
    return GestureDetector(
      onTap: () => _onItemTapped(index),
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: 48,
        height: 48,
        decoration: BoxDecoration(
          color: isSelected ? AppColors.ocean500 : AppColors.cloud200,
          shape: BoxShape.circle,
        ),
        child: Icon(
          icon,
          size: 24,
          color: isSelected
              ? AppColors.cloud200
              : AppColors.brand500.withValues(alpha: 0.5),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
      backgroundColor: AppColors.smoke200,
      body: IndexedStack(index: _selectedIndex, children: _screens),
      bottomNavigationBar: SafeArea(
        child: Container(
          margin: const EdgeInsets.only(left: 24, right: 24, bottom: 32),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.cloud200,
            borderRadius: BorderRadius.circular(40),
            border: BoxBorder.all(
              color: AppColors.brand500.withValues(alpha: 0.05),
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildNavItem(0, Icons.home_rounded),
              _buildNavItem(1, Icons.discount_outlined),
              _buildNavItem(2, Icons.favorite_outline_rounded),
              _buildNavItem(3, Icons.receipt_long_outlined),
              _buildNavItem(4, Icons.person_outline_rounded),
            ],
          ),
        ),
      ),
    );
  }
}
