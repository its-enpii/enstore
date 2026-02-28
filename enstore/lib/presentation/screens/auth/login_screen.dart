import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/services/auth_service.dart';
import '../../../core/network/api_client.dart';
import 'register_screen.dart';
import '../app/main_screen.dart';
import '../../widgets/buttons/app_button.dart';
import '../../widgets/inputs/app_text_field.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isLoading = false;

  Future<void> _handleLogin() async {
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Email dan password harus diisi')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final apiClient = ApiClient();
      final authService = AuthService(apiClient);

      final response = await authService.login(
        _emailController.text.trim(),
        _passwordController.text,
      );

      if (mounted) {
        if (response.success) {
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (_) => const MainScreen()),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                response.message.isEmpty
                    ? 'Gagal masuk. Coba lagi.'
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
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 60),
              // Header
              const Text(
                'Selamat Datang Kembali!',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: AppColors.brand500,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Masuk ke akun EnStore Anda untuk melanjutkan top-up favorit.',
                style: TextStyle(
                  fontSize: 16,
                  color: AppColors.brand500.withValues(alpha: 0.5),
                ),
              ),
              const SizedBox(height: 48),

              // Email Field
              AppTextField(
                label: 'Email atau No. HP',
                controller: _emailController,
                hintText: 'nama@email.com',
                prefixIcon: const Icon(Icons.person),
                keyboardType: TextInputType.emailAddress,
              ),

              const SizedBox(height: 24),

              // Password Field
              AppTextField(
                label: 'Password',
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

              // Forgot Password
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () {},
                  child: const Text(
                    'Lupa Password?',
                    style: TextStyle(
                      color: AppColors.ocean500,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 24),

              // Login Button
              AppButton(
                label: 'MASUK SEKARANG',
                onPressed: _handleLogin,
                isLoading: _isLoading,
                suffixIcon: Icons.arrow_forward_rounded,
                width: double.infinity,
              ),

              const SizedBox(height: 32),

              // Divider
              Row(
                children: [
                  Expanded(
                    child: Divider(
                      color: AppColors.brand500.withValues(alpha: 0.05),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      'ATAU',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AppColors.brand500.withValues(alpha: 0.2),
                      ),
                    ),
                  ),
                  Expanded(
                    child: Divider(
                      color: AppColors.brand500.withValues(alpha: 0.05),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 32),

              // Register Link
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Belum punya akun?',
                    style: TextStyle(
                      color: AppColors.brand500.withValues(alpha: 0.5),
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const RegisterScreen(),
                        ),
                      );
                    },
                    child: const Text(
                      'Daftar Gratis',
                      style: TextStyle(
                        color: AppColors.ocean500,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
