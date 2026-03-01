import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/services/auth_service.dart';
import '../../../../core/network/api_client.dart';
import '../../../widgets/feedback/app_toast.dart';
import '../../../widgets/inputs/app_text_field.dart';
import '../../../widgets/layout/app_app_bar.dart';

class SecurityScreen extends StatefulWidget {
  const SecurityScreen({super.key});

  @override
  State<SecurityScreen> createState() => _SecurityScreenState();
}

class _SecurityScreenState extends State<SecurityScreen> {
  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _isLoading = false;
  bool _obscureCurrent = true;
  bool _obscureNew = true;
  bool _obscureConfirm = true;

  @override
  void dispose() {
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _updatePassword() async {
    final current = _currentPasswordController.text.trim();
    final newPass = _newPasswordController.text.trim();
    final confirm = _confirmPasswordController.text.trim();

    if (current.isEmpty || newPass.isEmpty || confirm.isEmpty) {
      AppToast.warning(context, 'Tolong lengkapi semua field');
      return;
    }

    if (newPass.length < 8) {
      AppToast.warning(context, 'Password baru minimal 8 karakter');
      return;
    }

    if (newPass != confirm) {
      AppToast.warning(context, 'Konfirmasi password tidak cocok');
      return;
    }

    setState(() => _isLoading = true);

    try {
      final authService = AuthService(ApiClient());
      final response = await authService.changePassword({
        'current_password': current,
        'new_password': newPass,
        'new_password_confirmation': confirm,
      });

      if (mounted) {
        setState(() => _isLoading = false);
        if (response.success) {
          AppToast.success(context, 'Password berhasil diperbarui');
          Navigator.pop(context);
        } else {
          AppToast.error(
            context,
            response.message.isEmpty
                ? 'Gagal memperbarui password'
                : response.message,
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        AppToast.error(context, 'Terjadi kesalahan: $e');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.smoke200,
      appBar: AppAppBar(title: 'Security'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AppTextField(
              label: 'Current Password',
              controller: _currentPasswordController,
              hintText: 'Enter your current password',
              obscureText: _obscureCurrent,
              prefixIcon: const Icon(Icons.lock_outline_rounded),
              suffixIcon: IconButton(
                icon: Icon(
                  _obscureCurrent
                      ? Icons.visibility_off_outlined
                      : Icons.visibility_outlined,
                ),
                onPressed: () => setState(() => _obscureCurrent = !_obscureCurrent),
              ),
            ),
            const SizedBox(height: 24),

            AppTextField(
              label: 'New Password',
              controller: _newPasswordController,
              hintText: 'Min. 8 characters',
              obscureText: _obscureNew,
              prefixIcon: const Icon(Icons.lock_outline_rounded),
              suffixIcon: IconButton(
                icon: Icon(
                  _obscureNew
                      ? Icons.visibility_off_outlined
                      : Icons.visibility_outlined,
                ),
                onPressed: () => setState(() => _obscureNew = !_obscureNew),
              ),
            ),
            const SizedBox(height: 24),

            AppTextField(
              label: 'Confirm New Password',
              controller: _confirmPasswordController,
              hintText: 'Retype your new password',
              obscureText: _obscureConfirm,
              prefixIcon: const Icon(Icons.lock_outline_rounded),
              suffixIcon: IconButton(
                icon: Icon(
                  _obscureConfirm
                      ? Icons.visibility_off_outlined
                      : Icons.visibility_outlined,
                ),
                onPressed: () => setState(() => _obscureConfirm = !_obscureConfirm),
              ),
            ),
            const SizedBox(height: 48),

            InkWell(
              onTap: _isLoading ? null : _updatePassword,
              borderRadius: BorderRadius.circular(104),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 18),
                decoration: BoxDecoration(
                  color: AppColors.ocean500,
                  borderRadius: BorderRadius.circular(104),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.ocean500.withValues(alpha: 0.2),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                alignment: Alignment.center,
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          color: AppColors.smoke200,
                          strokeWidth: 2,
                          strokeCap: StrokeCap.round,
                        ),
                      )
                    : const Text(
                        'UPDATE PASSWORD',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.2,
                          color: AppColors.smoke200,
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
