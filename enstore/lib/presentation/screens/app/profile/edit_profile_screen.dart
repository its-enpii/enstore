import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/services/auth_service.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/models/user.dart';
import '../../../widgets/feedback/app_toast.dart';

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
      appBar: AppBar(
        backgroundColor: AppColors.smoke200,
        elevation: 0,
        centerTitle: true,
        title: Text(
          'Account Details',
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
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildFieldLabel('Full Name'),
                const SizedBox(height: 8),
                _buildTextField(
                  controller: _nameController,
                  hint: 'Enter your full name',
                  icon: Icons.person_outline_rounded,
                ),
                const SizedBox(height: 24),

                _buildFieldLabel('Phone Number'),
                const SizedBox(height: 8),
                _buildTextField(
                  controller: _phoneController,
                  hint: 'Enter your phone number',
                  icon: Icons.phone_outlined,
                  keyboardType: TextInputType.phone,
                ),
                const SizedBox(height: 24),

                _buildFieldLabel('Email Address (Readonly)'),
                const SizedBox(height: 8),
                _buildTextField(
                  controller: _emailController,
                  hint: 'Email address',
                  icon: Icons.email_outlined,
                  readOnly: true,
                ),
                const SizedBox(height: 48),

                InkWell(
                  onTap: _isLoading ? null : _updateProfile,
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
                            'Save Changes',
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
        ],
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

  Widget _buildTextField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    bool readOnly = false,
    TextInputType? keyboardType,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.cloud200,
        borderRadius: BorderRadius.circular(16),
      ),
      child: TextField(
        controller: controller,
        readOnly: readOnly,
        keyboardType: keyboardType,
        style: TextStyle(
          color: AppColors.brand500.withValues(
            alpha: readOnly ? 0.4 : 0.9,
          ),
          fontSize: 16,
          fontWeight: FontWeight.w500,
        ),
        decoration: InputDecoration(
          prefixIcon: Icon(
            icon,
            color: AppColors.brand500.withValues(alpha: 0.4),
            size: 20,
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
