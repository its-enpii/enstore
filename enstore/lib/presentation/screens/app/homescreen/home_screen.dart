import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/services/auth_service.dart';
import '../../../../core/services/utility_service.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/models/banner.dart';
import '../../../widgets/buttons/app_button.dart';
import '../../auth/login_screen.dart';
import 'product/game/game_list_screen.dart';
import 'product/pulsa/pulsa_screen.dart';
import 'product/data/data_screen.dart';
import 'product/voucher/voucher_screen.dart';
import 'product/e_wallet/e_wallet_screen.dart';
import 'product/internet/internet_screen.dart';
import '../../../widgets/cards/app_service_item.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _isLoggedIn = false;
  String _userName = 'Guest';
  String _balance = '0';

  // API Data
  List<BannerModel> _banners = [];
  bool _isLoadingBanners = true;

  @override
  void initState() {
    super.initState();
    _checkLoginStatus();
    _fetchData();
  }

  Future<void> _fetchData() async {
    final apiClient = ApiClient();
    final utilityService = UtilityService(apiClient);

    // Fetch Banners
    debugPrint(
      'Fetching banners from: ${ApiClient.baseUrl}${ApiEndpoints.banners}',
    );

    utilityService
        .getBanners()
        .then((response) {
          if (mounted) {
            setState(() {
              if (response.success) {
                _banners = response.data ?? [];
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Banner Error: ${response.message}'),
                    backgroundColor: Colors.red,
                  ),
                );
              }
              _isLoadingBanners = false;
            });
          }
        })
        .catchError((error) {
          if (mounted) {
            setState(() {
              _isLoadingBanners = false;
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Connection Error: $error'),
                  backgroundColor: Colors.red,
                ),
              );
            });
          }
        });
  }

  Future<void> _checkLoginStatus() async {
    final apiClient = ApiClient();
    final authService = AuthService(apiClient);
    final status = await authService.isLoggedIn();

    if (status) {
      final response = await authService.getMe();
      if (mounted && response.success) {
        setState(() {
          _isLoggedIn = true;
          _userName = response.data?.name ?? 'User';
          _balance = response.data?.balance ?? '0';
        });
      }
    } else {
      if (mounted) {
        setState(() {
          _isLoggedIn = false;
          _userName = 'Guest';
          _balance = '0';
        });
      }
    }
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning,';
    if (hour < 15) return 'Good Afternoon,';
    if (hour < 18) return 'Good Evening,';
    return 'Good Night,';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.smoke200,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          // Top Profile & Notification
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(24, 40, 24, 24),
              child: Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppColors.cloud200,
                      border: Border.all(
                        color: AppColors.brand500.withValues(alpha: 0.05),
                      ),
                      image: _isLoggedIn
                          ? const DecorationImage(
                              image: NetworkImage(
                                'https://i.pravatar.cc/150?img=11',
                              ),
                              fit: BoxFit.cover,
                            )
                          : null,
                    ),
                    child: _isLoggedIn
                        ? null
                        : const Icon(
                            Icons.person_rounded,
                            color: AppColors.brand500,
                            size: 28,
                          ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _isLoggedIn ? _getGreeting() : 'Welcome to,',
                          style: TextStyle(
                            color: AppColors.brand500.withValues(alpha: 0.4),
                            fontSize: 14,
                          ),
                        ),

                        Text(
                          _isLoggedIn ? _userName : 'EnStore',
                          style: TextStyle(
                            color: AppColors.brand500.withValues(alpha: 0.9),
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                  _isLoggedIn
                      ? Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.cloud200,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Icon(
                            Icons.notifications_none_rounded,
                            color: AppColors.brand500,
                            size: 24,
                          ),
                        )
                      : TextButton(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => const LoginScreen(),
                              ),
                            );
                          },
                          style: TextButton.styleFrom(
                            foregroundColor: AppColors.ocean500,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 20,
                              vertical: 12,
                            ),
                            backgroundColor: AppColors.ocean500.withValues(
                              alpha: 0.1,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(24),
                            ),
                          ),
                          child: const Text(
                            'Login',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ),
                ],
              ),
            ),
          ),

          // Balance Card
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Container(
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      AppColors.ocean500.withValues(alpha: 0.4),
                      AppColors.ocean500.withValues(alpha: 0.8),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _isLoggedIn ? 'Total Balance' : 'Gaming Wallet',
                              style: TextStyle(
                                color: AppColors.brand500.withValues(
                                  alpha: 0.4,
                                ),
                                fontSize: 14,
                              ),
                            ),

                            const SizedBox(height: 8),
                            Text(
                              _isLoggedIn ? 'Rp. $_balance' : 'Rp. --.---',
                              style: TextStyle(
                                color: AppColors.brand500.withValues(
                                  alpha: 0.9,
                                ),
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        _isLoggedIn
                            ? Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: AppColors.smoke200.withValues(
                                    alpha: 0.2,
                                  ),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  Icons.history_rounded,
                                  color: AppColors.brand500.withValues(
                                    alpha: 0.6,
                                  ),
                                  size: 20,
                                ),
                              )
                            : Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColors.smoke200.withValues(
                                    alpha: 0.2,
                                  ),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  'Guest',
                                  style: TextStyle(
                                    color: AppColors.brand500.withValues(
                                      alpha: 0.6,
                                    ),
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                      ],
                    ),

                    const SizedBox(height: 32),
                    Row(
                      children: [
                        Expanded(
                          child: AppButton(
                            label: 'Top Up',
                            prefixIcon: Icons.sync_rounded,
                            backgroundColor: AppColors.cloud200,
                            foregroundColor: AppColors.ocean500,
                            height: 48,
                            onPressed: () {
                              if (!_isLoggedIn) {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => const LoginScreen(),
                                  ),
                                );
                              }
                            },
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: AppButton(
                            label: _isLoggedIn ? 'Scan' : 'History',
                            prefixIcon: _isLoggedIn
                                ? Icons.qr_code_scanner_rounded
                                : Icons.history_rounded,
                            backgroundColor: AppColors.brand500.withValues(
                              alpha: 0.1,
                            ),
                            foregroundColor: AppColors.cloud200,
                            height: 48,
                            onPressed: () {
                              if (!_isLoggedIn) {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => const LoginScreen(),
                                  ),
                                );
                              }
                            },
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Services Grid
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(24, 32, 24, 0),
              child: Wrap(
                spacing: 0,
                runSpacing: 24,
                alignment: WrapAlignment.spaceBetween,
                children: [
                  AppServiceItem(
                    title: 'Games',
                    icon: Icons.sports_esports_rounded,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const GameListScreen(),
                        ),
                      );
                    },
                  ),
                  AppServiceItem(
                    title: 'Pulsa',
                    icon: Icons.phone_android_rounded,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const PulsaScreen()),
                      );
                    },
                  ),
                  AppServiceItem(
                    title: 'Data',
                    icon: Icons.language_rounded,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const DataScreen()),
                      );
                    },
                  ),
                  AppServiceItem(
                    title: 'Voucher',
                    icon: Icons.confirmation_number_rounded,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const VoucherScreen(),
                        ),
                      );
                    },
                  ),
                  AppServiceItem(
                    title: 'E-Wallet',
                    icon: Icons.account_balance_wallet_rounded,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const EWalletScreen(),
                        ),
                      );
                    },
                  ),
                  AppServiceItem(
                    title: 'Internet',
                    icon: Icons.wifi_rounded,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const InternetScreen(),
                        ),
                      );
                    },
                  ),
                  AppServiceItem(
                    title: 'Water',
                    icon: Icons.water_drop_rounded,
                    onTap: () {},
                  ),
                  AppServiceItem(
                    title: 'Electricity',
                    icon: Icons.bolt_rounded,
                    onTap: () {},
                  ),
                ],
              ),
            ),
          ),

          // Special Promos Section
          if (_isLoadingBanners || _banners.isNotEmpty) ...[
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 40, 20, 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Special Promos',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.brand500,
                      ),
                    ),
                    Text(
                      'View All',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: AppColors.ocean500,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Horizontal Promo List
            SliverToBoxAdapter(
              child: SizedBox(
                height: 180,
                child: _isLoadingBanners
                    ? const Center(
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : ListView(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        physics: const BouncingScrollPhysics(),
                        children: _banners
                            .map(
                              (banner) => _buildPromoCard(
                                banner.title,
                                banner.subtitle ?? '',
                                banner.image.startsWith('http')
                                    ? banner.image
                                    : '${ApiClient.baseUrl.replaceAll('/api', '')}/storage/${banner.image}',
                                link: banner.link,
                              ),
                            )
                            .toList(),
                      ),
              ),
            ),
          ],

          const SliverToBoxAdapter(child: SizedBox(height: 100)),
        ],
      ),
    );
  }


  Widget _buildPromoCard(
    String title,
    String subtitle,
    String imageUrl, {
    String? link,
  }) {
    return GestureDetector(
      onTap: () async {
        if (link != null && link.isNotEmpty) {
          final uri = Uri.parse(link);
          if (await canLaunchUrl(uri)) {
            await launchUrl(uri, mode: LaunchMode.externalApplication);
          }
        }
      },
      child: Container(
        width: 290,
        margin: const EdgeInsets.symmetric(horizontal: 8),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(32),
          image: DecorationImage(
            image: NetworkImage(imageUrl),
            fit: BoxFit.cover,
            colorFilter: ColorFilter.mode(
              AppColors.brand500.withValues(alpha: 0.4),
              BlendMode.darken,
            ),
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              Text(
                title,
                style: const TextStyle(
                  color: AppColors.smoke200,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: TextStyle(
                  color: AppColors.smoke200.withValues(alpha: 0.8),
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
