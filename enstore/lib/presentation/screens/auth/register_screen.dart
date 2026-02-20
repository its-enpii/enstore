import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/services/auth_service.dart';
import '../../../core/network/api_client.dart';
import '../../widgets/app_button.dart';
import '../main/dashboard_screen.dart';
import '../../widgets/app_text_field.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isLoading = false;

  Future<void> _handleRegister() async {
    if (_firstNameController.text.isEmpty ||
        _emailController.text.isEmpty ||
        _phoneController.text.isEmpty ||
        _passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Harap isi semua kolom wajib')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final apiClient = ApiClient();
      final authService = AuthService(apiClient);

      final response = await authService.register({
        'first_name': _firstNameController.text.trim(),
        'last_name': _lastNameController.text.trim(),
        'email': _emailController.text.trim(),
        'phone': _phoneController.text.trim(),
        'password': _passwordController.text,
        'password_confirmation': _passwordController.text, // Simple case
      });

      if (mounted) {
        if (response.success) {
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (_) => const DashboardScreen()),
            (route) => false,
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                response.message.isEmpty
                    ? 'Gagal mendaftar. Coba lagi.'
                    : response.message,
              ),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Terjadi kesalahan: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.smoke200,
      appBar: AppBar(
        backgroundColor: AppColors.smoke200,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: AppColors.brand500),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Buat Akun Baru',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: AppColors.brand500,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Mulai perjalanan gaming Anda bersama EnStore hari ini.',
                style: TextStyle(
                  fontSize: 16,
                  color: AppColors.brand500.withOpacity(0.5),
                ),
              ),
              const SizedBox(height: 32),

              // Name Grid (First & Last Name)
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildLabel('Nama Depan'),
                        const SizedBox(height: 8),
                        AppTextField(
                          controller: _firstNameController,
                          hintText: 'John',
                          prefixIcon: const Icon(Icons.person_outline_rounded),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildLabel('Nama Belakang'),
                        const SizedBox(height: 8),
                        AppTextField(
                          controller: _lastNameController,
                          hintText: 'Doe',
                          prefixIcon: const Icon(Icons.person_outline_rounded),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 20),

              // Email Field
              _buildLabel('Alamat Email'),
              const SizedBox(height: 8),
              AppTextField(
                controller: _emailController,
                hintText: 'nama@email.com',
                prefixIcon: const Icon(Icons.email_outlined),
                keyboardType: TextInputType.emailAddress,
              ),

              const SizedBox(height: 20),

              // Phone Field
              _buildLabel('Nomor WhatsApp'),
              const SizedBox(height: 8),
              AppTextField(
                controller: _phoneController,
                hintText: '08123456789',
                prefixIcon: const Icon(Icons.phone_android_rounded),
                keyboardType: TextInputType.phone,
              ),

              const SizedBox(height: 20),

              // Password Field
              _buildLabel('Buat Password'),
              const SizedBox(height: 8),
              AppTextField(
                controller: _passwordController,
                hintText: '••••••••',
                prefixIcon: const Icon(Icons.lock_outline_rounded),
                obscureText: _obscurePassword,
                suffixIcon: IconButton(
                  icon: Icon(
                    _obscurePassword
                        ? Icons.visibility_off_outlined
                        : Icons.visibility_outlined,
                  ),
                  onPressed: () =>
                      setState(() => _obscurePassword = !_obscurePassword),
                ),
              ),

              const SizedBox(height: 32),

              // Register Button
              AppButton(
                label: 'DAFTAR SEKARANG',
                onPressed: _handleRegister,
                isLoading: _isLoading,
                suffixIcon: Icons.how_to_reg_rounded,
              ),

              const SizedBox(height: 24),

              // Terms Agreement
              Center(
                child: RichText(
                  textAlign: TextAlign.center,
                  text: TextSpan(
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.brand500.withOpacity(0.5),
                      fontFamily: 'Inter',
                    ),
                    children: [
                      const TextSpan(
                        text: 'Dengan mendaftar, Anda menyetujui ',
                      ),
                      TextSpan(
                        text: 'Ketentuan Layanan',
                        style: const TextStyle(
                          color: AppColors.ocean500,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const TextSpan(text: ' & '),
                      TextSpan(
                        text: 'Kebijakan Privasi',
                        style: const TextStyle(
                          color: AppColors.ocean500,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String label) {
    return Text(
      label,
      style: const TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.bold,
        color: AppColors.brand500,
      ),
    );
  }
}
