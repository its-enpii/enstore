import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/services/auth_service.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/models/user.dart';
import '../main_screen.dart';
import 'edit_profile_screen.dart';
import '../../../widgets/feedback/app_dialog.dart';
import '../../../widgets/feedback/app_skeleton.dart';
import '../../../widgets/feedback/app_toast.dart';
import 'package:intl/intl.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import 'package:url_launcher/url_launcher.dart';
import 'security_screen.dart';

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
    AppDialog.show(
      context,
      title: 'Konfirmasi Logout',
      message: 'Apakah Anda yakin ingin keluar dari aplikasi?',
      type: AppDialogType.danger,
      confirmLabel: 'Logout',
      cancelLabel: 'Batal',
      onConfirm: () async {
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
            ScaffoldMessenger.of(
              context,
            ).showSnackBar(SnackBar(content: Text('Gagal logout: $e')));
          }
        }
      },
    );
  }

  Future<void> _pickAndUploadAvatar() async {
    try {
      final picker = ImagePicker();
      final pickedFile = await picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 512,
        maxHeight: 512,
        imageQuality: 70,
      );

      if (pickedFile == null) return; // User canceled

      setState(() => _isLoading = true);

      // Read as Multipart File
      final formData = FormData.fromMap({
        'avatar': await MultipartFile.fromFile(
          pickedFile.path,
          filename: pickedFile.name,
        ),
      });

      // Upload
      final apiClient = ApiClient();
      final authService = AuthService(apiClient);

      final response = await authService.updateProfileWithAvatar(formData);

      if (mounted) {
        if (response.success) {
          setState(() {
            _user = response.data;
            _isLoading = false;
          });
          
          AppToast.success(context, 'Foto profil berhasil diperbarui');
        } else {
          setState(() => _isLoading = false);
          AppToast.error(
            context,
            response.message.isEmpty ? 'Gagal upload foto' : response.message,
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

  Future<void> _navigateToEditProfile() async {
    if (_user == null) return;
    final result = await Navigator.of(
      context,
    ).push(MaterialPageRoute(builder: (_) => EditProfileScreen(user: _user!)));
    if (result == true) {
      if (mounted) {
        setState(() => _isLoading = true);
        _fetchProfile();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_user == null && _isLoading) {
      return Scaffold(
        backgroundColor: AppColors.smoke200,
        body: SafeArea(
          child: AppShimmer(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Column(
                      children: const [
                        AppSkeletonCircle(size: 112),
                        SizedBox(height: 24),
                        AppSkeletonText(width: 150, height: 20),
                        SizedBox(height: 8),
                        AppSkeletonText(width: 100, height: 14),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                  const AppSkeleton(
                    width: double.infinity,
                    height: 80,
                    borderRadius: 24,
                  ),
                  const SizedBox(height: 32),
                  const AppSkeletonText(width: 100, height: 14),
                  const SizedBox(height: 16),
                  const AppSkeleton(
                    width: double.infinity,
                    height: 60,
                    borderRadius: 16,
                  ),
                  const SizedBox(height: 8),
                  const AppSkeleton(
                    width: double.infinity,
                    height: 60,
                    borderRadius: 16,
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    // Default formatter assuming the string is numeric. If not, fallback to string exactly as is.
    String formattedBalance = '0';
    try {
      if (_user?.balance != null) {
        final doubleValue = double.parse(_user!.balance!);
        formattedBalance = NumberFormat.currency(
          locale: 'id_ID',
          symbol: '',
          decimalDigits: 0,
        ).format(doubleValue);
      }
    } catch (e) {
      formattedBalance = _user?.balance ?? '0';
    }

    String formattedBonus = '0';
    try {
      if (_user?.bonusBalance != null) {
        final doubleValue = double.parse(_user!.bonusBalance!);
        formattedBonus = NumberFormat.currency(
          locale: 'id_ID',
          symbol: '',
          decimalDigits: 0,
        ).format(doubleValue);
      }
    } catch (e) {
      formattedBonus = _user?.bonusBalance ?? '0';
    }

    return Stack(
      children: [
        Scaffold(
          backgroundColor: AppColors.smoke200,
          body: SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Profile Header
                  Center(
                    child: Column(
                      children: [
                        Stack(
                          children: [
                            Container(
                              width: 112,
                              height: 112,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: AppColors.cloud200,
                                image: _user?.avatar != null
                                    ? DecorationImage(
                                        image: NetworkImage(_user!.avatar!),
                                        fit: BoxFit.cover,
                                      )
                                    : null,
                              ),
                              child: _user?.avatar == null
                                  ? Icon(
                                      Icons.person_rounded,
                                      size: 60,
                                      color: AppColors.brand500.withValues(
                                        alpha: 0.9,
                                      ),
                                    )
                                  : null,
                            ),
                            Positioned(
                              bottom: 0,
                              right: 4,
                              child: GestureDetector(
                                onTap: _pickAndUploadAvatar,
                                child: Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: const BoxDecoration(
                                    color: AppColors.ocean500,
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(
                                    Icons.edit_rounded,
                                    color: AppColors.smoke200,
                                    size: 16,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),
                        Text(
                          _user?.name ?? 'Nama Pengguna',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: AppColors.brand500.withValues(alpha: 0.9),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.ocean500.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(104),
                          ),
                          child: Text(
                            _user?.customerType != null &&
                                    _user!.customerType!.isNotEmpty
                                ? "${_user!.customerType![0].toUpperCase()}${_user!.customerType!.substring(1).toLowerCase()}"
                                : 'Guest',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AppColors.ocean500,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 32),

                  // 2. Balance & Points Card
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: AppColors.cloud200,
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: IntrinsicHeight(
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Total Balance',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                    color: AppColors.brand500.withValues(
                                      alpha: 0.4,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Rp. $formattedBalance',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.brand500.withValues(
                                      alpha: 0.9,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),

                          VerticalDivider(
                            color: AppColors.brand500.withValues(alpha: 0.1),
                            thickness: 1,
                          ),

                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  'Points',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                    color: AppColors.brand500.withValues(
                                      alpha: 0.4,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Rp. $formattedBonus',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.brand500.withValues(
                                      alpha: 0.9,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 32),

                  // 3. Personal Section
                  Text(
                    'Personal',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.brand500.withValues(alpha: 0.5),
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildActionCard(
                    'Account Details',
                    Icons.person_outline_rounded,
                    onTap: _navigateToEditProfile,
                  ),
                  const SizedBox(height: 8),
                  _buildActionCard(
                    'Security',
                    Icons.shield_outlined,
                    onTap: _navigateToSecurity,
                  ),

                  const SizedBox(height: 32),

                  // 4. Support Section
                  Text(
                    'Support',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.brand500.withValues(alpha: 0.5),
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildActionCard(
                    'Help Center',
                    Icons.headset_mic_outlined,
                    onTap: _openHelpCenter,
                  ),
                  const SizedBox(height: 8),
                  _buildActionCard(
                    'App Settings',
                    Icons.settings_outlined,
                    onTap: _showAppSettings,
                  ),

                  const SizedBox(height: 32),

                  // 5. Logout Button
                  InkWell(
                    onTap: _handleLogout,
                    borderRadius: BorderRadius.circular(104),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(104),
                        border: Border.all(color: AppColors.error),
                      ),
                      alignment: Alignment.center,
                      child: const Text(
                        'Logout',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                          color: AppColors.error,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(
                    height: 16,
                  ), // Extra padding for bottom nav safely
                ],
              ),
            ),
          ),
        ),
        if (_isLoading && _user != null)
          Container(
            color: AppColors.smoke200.withValues(alpha: 0.5),
            child: const Center(child: CircularProgressIndicator()),
          ),
      ],
    );
  }

  void _navigateToSecurity() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const SecurityScreen()),
    );
  }

  Future<void> _openHelpCenter() async {
    const phone = '6281234567890'; // CS Placeholder
    final whatsappUrl = Uri.parse('https://wa.me/$phone');
    if (await canLaunchUrl(whatsappUrl)) {
      await launchUrl(whatsappUrl, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        AppToast.error(context, 'Tidak dapat membuka WhatsApp');
      }
    }
  }

  void _showAppSettings() {
    AppDialog.show(
      context,
      title: 'Pemberitahuan',
      message: 'Fitur pengaturan aplikasi sedang dalam pengembangan',
      type: AppDialogType.info,
      confirmLabel: 'Tutup',
      onConfirm: () async => Navigator.pop(context),
    );
  }

  Widget _buildActionCard(String title, IconData icon, {VoidCallback? onTap}) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap:
            onTap ??
            () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Fitur belum tersedia')),
              );
            },
        borderRadius: BorderRadius.circular(24),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cloud200,
            borderRadius: BorderRadius.circular(24),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.smoke200,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Icon(
                  icon,
                  color: AppColors.brand500.withValues(alpha: 0.9),
                  size: 24,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: AppColors.brand500.withValues(alpha: 0.9),
                  ),
                ),
              ),
              Icon(
                Icons.chevron_right_rounded,
                color: AppColors.brand500.withValues(alpha: 0.3),
                size: 24,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
