import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/services/auth_service.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/models/user.dart';
import '../../../widgets/feedback/app_toast.dart';
import '../../../widgets/inputs/app_text_field.dart';
import '../../../widgets/layout/app_app_bar.dart';

class EditProfileScreen extends StatefulWidget {
  final User user;
  const EditProfileScreen({super.key, required this.user});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  late TextEditingController _emailController;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.user.name);
    _phoneController = TextEditingController(text: widget.user.phone);
    _emailController = TextEditingController(text: widget.user.email);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _updateProfile() async {
    if (_nameController.text.trim().isEmpty) {
      AppToast.warning(context, 'Nama tidak boleh kosong');
      return;
    }

    if (_phoneController.text.trim().isEmpty) {
      AppToast.warning(context, 'Nomor telepon tidak boleh kosong');
      return;
    }

    setState(() => _isLoading = true);

    try {
      final authService = AuthService(ApiClient());

      final Map<String, dynamic> data = {
        'name': _nameController.text.trim(),
        'phone': _phoneController.text.trim(),
      };

      final response = await authService.updateProfile(data);

      if (mounted) {
        setState(() => _isLoading = false);
        if (response.success) {
          AppToast.success(context, 'Profil berhasil diperbarui');
          Navigator.of(context).pop(true);
        } else {
          AppToast.error(
            context,
            response.message.isEmpty
                ? 'Gagal memperbarui profil'
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
      appBar: AppAppBar(title: 'Account Details'),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                AppTextField(
                  label: 'Full Name',
                  controller: _nameController,
                  hintText: 'Enter your full name',
                  prefixIcon: const Icon(Icons.person_outline_rounded),
                ),
                const SizedBox(height: 24),

                AppTextField(
                  label: 'Phone Number',
                  controller: _phoneController,
                  hintText: 'Enter your phone number',
                  prefixIcon: const Icon(Icons.phone_outlined),
                  keyboardType: TextInputType.phone,
                ),
                const SizedBox(height: 24),

                AppTextField(
                  label: 'Email Address',
                  controller: _emailController,
                  hintText: 'Email address',
                  prefixIcon: const Icon(Icons.email_outlined),
                  readOnly: true,
                  helperText: 'Email address cannot be changed.',
                ),
                const SizedBox(height: 48),

                InkWell(
                  onTap: _isLoading ? null : _updateProfile,
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
                            ),
                          )
                        : const Text(
                            'SAVE CHANGES',
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
        ],
      ),
    );
  }
}
