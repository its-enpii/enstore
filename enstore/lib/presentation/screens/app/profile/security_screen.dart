import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/services/auth_service.dart';
import '../../../../core/network/api_client.dart';
import '../../../widgets/feedback/app_toast.dart';

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
      appBar: AppBar(
        backgroundColor: AppColors.smoke200,
        elevation: 0,
        centerTitle: true,
        title: Text(
          'Security',
          style: TextStyle(
            color: AppColors.brand500.withValues(alpha: 0.9),
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back_ios_new_rounded,
            color: AppColors.brand500.withValues(alpha: 0.9),
            size: 20,
          ),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildFieldLabel('Current Password'),
            const SizedBox(height: 8),
            _buildPasswordField(
              controller: _currentPasswordController,
              hint: 'Enter your current password',
              obscureText: _obscureCurrent,
              onToggle: () => setState(() => _obscureCurrent = !_obscureCurrent),
            ),
            const SizedBox(height: 24),

            _buildFieldLabel('New Password'),
            const SizedBox(height: 8),
            _buildPasswordField(
              controller: _newPasswordController,
              hint: 'Min. 8 characters',
              obscureText: _obscureNew,
              onToggle: () => setState(() => _obscureNew = !_obscureNew),
            ),
            const SizedBox(height: 24),

            _buildFieldLabel('Confirm New Password'),
            const SizedBox(height: 8),
            _buildPasswordField(
              controller: _confirmPasswordController,
              hint: 'Retype your new password',
              obscureText: _obscureConfirm,
              onToggle: () =>
                  setState(() => _obscureConfirm = !_obscureConfirm),
            ),
            const SizedBox(height: 48),

            InkWell(
              onTap: _isLoading ? null : _updatePassword,
              borderRadius: BorderRadius.circular(104),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 16),
                decoration: BoxDecoration(
                  color: AppColors.ocean500,
                  borderRadius: BorderRadius.circular(104),
                ),
                alignment: Alignment.center,
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          color: AppColors.smoke200,
                          strokeWidth: 2,
                        ),
                      )
                    : const Text(
                        'Update Password',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
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

  Widget _buildFieldLabel(String label) {
    return Text(
      label,
      style: TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.w600,
        color: AppColors.brand500.withValues(alpha: 0.6),
      ),
    );
  }

  Widget _buildPasswordField({
    required TextEditingController controller,
    required String hint,
    required bool obscureText,
    required VoidCallback onToggle,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.cloud200,
        borderRadius: BorderRadius.circular(16),
      ),
      child: TextField(
        controller: controller,
        obscureText: obscureText,
        style: TextStyle(
          color: AppColors.brand500.withValues(alpha: 0.9),
          fontSize: 16,
          fontWeight: FontWeight.w500,
        ),
        decoration: InputDecoration(
          prefixIcon: Icon(
            Icons.lock_outline_rounded,
            color: AppColors.brand500.withValues(alpha: 0.4),
            size: 20,
          ),
          suffixIcon: IconButton(
            icon: Icon(
              obscureText
                  ? Icons.visibility_off_outlined
                  : Icons.visibility_outlined,
              color: AppColors.brand500.withValues(alpha: 0.4),
              size: 20,
            ),
            onPressed: onToggle,
          ),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 24,
            vertical: 16,
          ),
          hintText: hint,
          hintStyle: TextStyle(
            color: AppColors.brand500.withValues(alpha: 0.3),
          ),
        ),
      ),
    );
  }
}
