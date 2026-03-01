import 'dart:async';
import 'package:flutter/material.dart';
import '../../../../../../core/theme/app_colors.dart';
import '../../../../../../core/network/api_client.dart';
import '../../../../../../core/services/product_service.dart';
import '../../../../../../core/models/product.dart';
import '../../../../../widgets/layout/app_app_bar.dart';
import '../../../../../widgets/cards/app_service_item.dart';
import '../../../../../widgets/feedback/app_skeleton.dart';
import 'e_wallet_detail_screen.dart';

class EWalletScreen extends StatefulWidget {
  const EWalletScreen({super.key});

  @override
  State<EWalletScreen> createState() => _EWalletScreenState();
}

class _EWalletScreenState extends State<EWalletScreen> {
  List<Product> _eWallets = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchEWallets();
  }

  Future<void> _fetchEWallets() async {
    final apiClient = ApiClient();
    final productService = ProductService(apiClient);

    setState(() => _isLoading = true);

    try {
      final response = await productService.getProducts(
        filters: {'category': 'e-money', 'page': 1, 'limit': 100},
      );
      if (mounted) {
        setState(() {
          if (response.success && response.data != null) {
            _eWallets = response.data!.data;
          }
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.smoke200,
      appBar: const AppAppBar(title: 'E-Wallet'),
      body: _isLoading
          ? AppShimmer(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(24, 0, 24, 100),
                child: Wrap(
                  spacing: 0,
                  runSpacing: 24,
                  alignment: WrapAlignment.start,
                  children: List.generate(
                    8,
                    (index) => SizedBox(
                      width: (MediaQuery.of(context).size.width - 48) / 4,
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 56,
                            height: 56,
                            decoration: BoxDecoration(
                              color: AppColors.cloud200,
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                          const SizedBox(height: 8),
                          const AppSkeleton(height: 12, width: 64),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            )
          : _eWallets.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.account_balance_wallet_outlined,
                        size: 64,
                        color: AppColors.brand500.withValues(alpha: 0.2),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'No E-Wallet products available',
                        style: TextStyle(
                          color: AppColors.brand500.withValues(alpha: 0.5),
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                )
              : SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.fromLTRB(24, 0, 24, 100),
                  child: Wrap(
                    spacing: 0,
                    runSpacing: 24,
                    alignment: WrapAlignment.start,
                    children: _eWallets.map((wallet) {
                      return AppServiceItem(
                        title: wallet.name,
                        imageUrl: wallet.icon ?? wallet.image,
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) =>
                                  EWalletDetailScreen(product: wallet),
                            ),
                          );
                        },
                      );
                    }).toList(),
                  ),
                ),
    );
  }
}
