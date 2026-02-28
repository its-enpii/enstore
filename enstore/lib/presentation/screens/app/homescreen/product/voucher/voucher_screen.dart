import 'dart:async';
import 'package:flutter/material.dart';
import '../../../../../../core/theme/app_colors.dart';
import '../../../../../../core/network/api_client.dart';
import '../../../../../../core/services/product_service.dart';
import '../../../../../../core/models/product.dart';
import '../../../../../widgets/layout/app_app_bar.dart';
import '../../../../../widgets/cards/app_service_item.dart';
import 'voucher_detail_screen.dart';

class VoucherScreen extends StatefulWidget {
  const VoucherScreen({super.key});

  @override
  State<VoucherScreen> createState() => _VoucherScreenState();
}

class _VoucherScreenState extends State<VoucherScreen> {
  List<Product> _vouchers = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchVouchers();
  }

  Future<void> _fetchVouchers() async {
    final apiClient = ApiClient();
    final productService = ProductService(apiClient);

    setState(() => _isLoading = true);

    try {
      final response = await productService.getProducts(
        filters: {'category': 'voucher', 'page': 1, 'limit': 100},
      );
      if (mounted) {
        setState(() {
          if (response.success && response.data != null) {
            _vouchers = response.data!.data;
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
      appBar: const AppAppBar(title: 'Voucher'),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.ocean500),
            )
          : _vouchers.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.confirmation_number_outlined,
                        size: 64,
                        color: AppColors.brand500.withValues(alpha: 0.2),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'No vouchers available',
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
                    alignment: WrapAlignment.spaceBetween,
                    children: _vouchers.map((voucher) {
                      return AppServiceItem(
                        title: voucher.name,
                        imageUrl: voucher.icon ?? voucher.image,
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) =>
                                  VoucherDetailScreen(product: voucher),
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
