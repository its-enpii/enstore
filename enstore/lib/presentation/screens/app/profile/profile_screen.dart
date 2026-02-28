import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/services/auth_service.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/models/user.dart';
import '../main_screen.dart';
import '../../../widgets/buttons/app_button.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  User? _user;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  Future<void> _fetchProfile() async {
    try {
      final apiClient = ApiClient();
      final authService = AuthService(apiClient);
      final response = await authService.getMe();

      if (mounted) {
        setState(() {
          if (response.success) {
            _user = response.data;
          }
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _handleLogout() async {
    setState(() => _isLoading = true);
    try {
      final apiClient = ApiClient();
      final authService = AuthService(apiClient);
      await authService.logout();

      if (mounted) {
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (_) => const MainScreen()),
          (route) => false,
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Gagal logout: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: AppColors.smoke200,
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.smoke200,
      appBar: AppBar(
        title: const Text(
          'Profil Saya',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: AppColors.smoke200,
        elevation: 0,
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // Profile Header
            Center(
              child: Column(
                children: [
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppColors.cloud200,
                      border: Border.all(
                        color: AppColors.brand500.withOpacity(0.1),
                        width: 4,
                      ),
                    ),
                    child: const Icon(
                      Icons.person_rounded,
                      size: 60,
                      color: AppColors.brand500,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    _user?.name ?? 'Guest User',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: AppColors.brand500,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _user?.email ?? '',
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.brand500.withOpacity(0.5),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 40),

            // Info Section
            _buildInfoCard(),

            const SizedBox(height: 40),

            // Logout Button
            AppButton(
              label: 'LOGOUT',
              onPressed: _handleLogout,
              backgroundColor: Colors.red.withOpacity(0.1),
              foregroundColor: Colors.red,
              prefixIcon: Icons.logout_rounded,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.cloud200,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        children: [
          _buildInfoRow(
            Icons.account_balance_wallet_rounded,
            'Saldo',
            'Rp ${_user?.balance ?? '0'}',
          ),
          Divider(height: 32, color: AppColors.brand500.withValues(alpha: 0.1)),
          _buildInfoRow(
            Icons.verified_user_rounded,
            'Status Akun',
            _user?.role.toUpperCase() ?? '',
          ),
          Divider(height: 32, color: AppColors.brand500.withValues(alpha: 0.1)),
          _buildInfoRow(
            Icons.phone_android_rounded,
            'No. HP',
            _user?.phone ?? '-',
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, color: AppColors.ocean500, size: 24),
        const SizedBox(width: 16),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: AppColors.brand500.withOpacity(0.5),
              ),
            ),
            Text(
              value,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppColors.brand500,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
