import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/services/auth_service.dart';
import '../../../core/network/api_client.dart';
import '../../widgets/buttons/app_button.dart';
import '../app/main_screen.dart';
import '../../widgets/inputs/app_text_field.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter_facebook_auth/flutter_facebook_auth.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

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
        'name':
            '${_firstNameController.text.trim()} ${_lastNameController.text.trim()}'
                .trim(),
        'email': _emailController.text.trim(),
        'phone': _phoneController.text.trim(),
        'password': _passwordController.text,
        'password_confirmation': _passwordController.text, // Simple case
      });

      if (mounted) {
        if (response.success) {
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (_) => const MainScreen()),
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

  Future<void> _handleGoogleLogin() async {
    setState(() => _isLoading = true);
    try {
      final googleSignIn = GoogleSignIn(
        serverClientId: dotenv.env['GOOGLE_SERVER_CLIENT_ID'],
      );
      await googleSignIn.signOut(); // Force account picker
      final googleUser = await googleSignIn.signIn();
      if (googleUser == null) {
        setState(() => _isLoading = false);
        return;
      }

      final googleAuth = await googleUser.authentication;
      final accessToken = googleAuth.accessToken;

      if (accessToken == null) {
        throw Exception('Gagal mendapatkan access token dari Google');
      }

      final apiClient = ApiClient();
      final authService = AuthService(apiClient);
      final response = await authService.socialLogin('google', accessToken);

      if (mounted) {
        if (response.success) {
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (_) => const MainScreen()),
            (route) => false,
          );
        } else {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text(response.message)));
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Google Login Error: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _handleFacebookLogin() async {
    setState(() => _isLoading = true);
    try {
      final result = await FacebookAuth.instance.login();
      if (result.status != LoginStatus.success) {
        setState(() => _isLoading = false);
        if (result.status == LoginStatus.failed) {
          throw Exception(result.message);
        }
        return;
      }

      final accessToken = result.accessToken?.tokenString;
      if (accessToken == null) {
        throw Exception('Gagal mendapatkan access token dari Facebook');
      }

      final apiClient = ApiClient();
      final authService = AuthService(apiClient);
      final response = await authService.socialLogin('facebook', accessToken);

      if (mounted) {
        if (response.success) {
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (_) => const MainScreen()),
            (route) => false,
          );
        } else {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text(response.message)));
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Facebook Login Error: ${e.toString()}')),
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
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back_rounded,
            color: AppColors.brand500.withValues(alpha: 0.9),
          ),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Buat Akun Baru',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: AppColors.brand500.withValues(alpha: 0.9),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Mulai perjalanan gaming Anda bersama EnStore hari ini.',
                style: TextStyle(
                  fontSize: 16,
                  color: AppColors.brand500.withValues(alpha: 0.5),
                ),
              ),
              const SizedBox(height: 32),

              // Name Grid (First & Last Name)
              Row(
                children: [
                  Expanded(
                    child: AppTextField(
                      label: 'Nama Depan',
                      controller: _firstNameController,
                      hintText: 'John',
                      prefixIcon: const Icon(Icons.person_outline_rounded),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: AppTextField(
                      label: 'Nama Belakang',
                      controller: _lastNameController,
                      hintText: 'Doe',
                      prefixIcon: const Icon(Icons.person_outline_rounded),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Email Field
              AppTextField(
                label: 'Alamat Email',
                controller: _emailController,
                hintText: 'nama@email.com',
                prefixIcon: const Icon(Icons.email_outlined),
                keyboardType: TextInputType.emailAddress,
              ),

              const SizedBox(height: 24),

              // Phone Field
              AppTextField(
                label: 'Nomor WhatsApp',
                controller: _phoneController,
                hintText: '08123456789',
                prefixIcon: const Icon(Icons.phone_android_rounded),
                keyboardType: TextInputType.phone,
              ),

              const SizedBox(height: 24),

              // Password Field
              AppTextField(
                label: 'Buat Password',
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
                width: double.infinity,
              ),

              const SizedBox(height: 24),

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

              const SizedBox(height: 24),

              // Social Login Buttons
              Row(
                children: [
                  Expanded(
                    child: AppButton(
                      label: 'Google',
                      onPressed: _handleGoogleLogin,
                      isLoading: _isLoading,
                      backgroundColor: Colors.transparent,
                      foregroundColor: AppColors.brand500,
                      disabledBackgroundColor: Colors.transparent,
                      disabledForegroundColor: AppColors.brand500.withValues(
                        alpha: 0.5,
                      ),
                      side: BorderSide(
                        color: AppColors.brand500.withValues(alpha: 0.1),
                      ),
                      prefixWidget: SvgPicture.asset(
                        'assets/icons/google.svg',
                        width: 20,
                        height: 20,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: AppButton(
                      label: 'Facebook',
                      onPressed: _handleFacebookLogin,
                      isLoading: _isLoading,
                      backgroundColor: Colors.transparent,
                      foregroundColor: AppColors.brand500,
                      disabledBackgroundColor: Colors.transparent,
                      disabledForegroundColor: AppColors.brand500.withValues(
                        alpha: 0.5,
                      ),
                      side: BorderSide(
                        color: AppColors.brand500.withValues(alpha: 0.1),
                      ),
                      prefixWidget: SvgPicture.asset(
                        'assets/icons/facebook.svg',
                        width: 20,
                        height: 20,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Terms Agreement
              Center(
                child: RichText(
                  textAlign: TextAlign.center,
                  text: TextSpan(
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.brand500.withValues(alpha: 0.5),
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
}
