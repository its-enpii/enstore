import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../../../core/models/product.dart';
import '../../../../../../core/models/product_item.dart';
import '../../../../../../core/theme/app_colors.dart';
import '../../../../../../core/network/api_client.dart';
import '../../../../../../core/services/product_service.dart';
import '../../../../../widgets/layout/app_sticky_footer.dart';
import '../../../../../widgets/layout/app_app_bar.dart';
import '../../../../../widgets/feedback/app_toast.dart';
import '../../../../../widgets/inputs/app_product_input_form.dart';
import '../../../../../widgets/cards/app_product_item_card.dart';
import '../../../../../widgets/feedback/app_skeleton.dart';
import '../../checkout/checkout_screen.dart';

class ElectricityScreen extends StatefulWidget {
  const ElectricityScreen({super.key});

  @override
  State<ElectricityScreen> createState() => _ElectricityScreenState();
}

class _ElectricityScreenState extends State<ElectricityScreen> {
  final Map<String, TextEditingController> _controllers = {};
  Product? _product;
  ProductItem? _selectedItem;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _controllers['meter_no'] = TextEditingController();
    _fetchProduct();
  }

  @override
  void dispose() {
    for (var controller in _controllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> _fetchProduct() async {
    final apiClient = ApiClient();
    final productService = ProductService(apiClient);

    try {
      final response = await productService.getProductBySlug('pln-token');
      if (mounted) {
        setState(() {
          if (response.success) {
            _product = response.data;
          }
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        AppToast.error(context, 'Failed to load electricity products: $e');
      }
    }
  }

  String _formatPrice(int price) {
    return NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp. ',
      decimalDigits: 0,
    ).format(price);
  }

  bool get _canProceed {
    if (_selectedItem == null) return false;
    if (_controllers['meter_no']?.text.isEmpty ?? true) return false;
    return true;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.smoke200,
      appBar: const AppAppBar(title: 'Electricity'),
      body: Stack(
        children: [
          SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(24, 0, 24, 120),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildInputForm(),
                const SizedBox(height: 16),
                _buildNominalGrid(),
              ],
            ),
          ),
          Align(
            alignment: Alignment.bottomCenter,
            child: _buildFooter(),
          ),
        ],
      ),
    );
  }

  Widget _buildInputForm() {
    final fields = _product?.inputFields ??
        [
          {
            'name': 'meter_no',
            'label': 'Meter / ID Pelanggan',
            'placeholder': 'Contoh: 1234567890',
            'type': 'tel',
            'required': true,
          },
        ];

    return AppProductInputForm(
      fields: fields,
      controllers: _controllers,
      formValues: const {},
      prefixIcons: {'meter_no': const Icon(Icons.bolt_rounded)},
      onFieldChanged: (_, __) => setState(() {}),
      padding: EdgeInsets.zero,
    );
  }

  Widget _buildNominalGrid() {
    if (_isLoading) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const AppSkeleton(height: 20, width: 140),
          const SizedBox(height: 16),
          AppShimmer(
            child: GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.96,
                crossAxisSpacing: 24,
                mainAxisSpacing: 24,
              ),
              itemCount: 4,
              itemBuilder: (_, __) => Container(
                decoration: BoxDecoration(
                  color: AppColors.cloud200,
                  borderRadius: BorderRadius.circular(24),
                ),
              ),
            ),
          ),
        ],
      );
    }

    if (_product == null || _product!.items.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Select Nominal',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: AppColors.brand500.withValues(alpha: 0.9),
          ),
        ),
        const SizedBox(height: 16),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 0.96,
            crossAxisSpacing: 24,
            mainAxisSpacing: 24,
          ),
          itemCount: _product!.items.length,
          itemBuilder: (context, index) {
            final item = _product!.items[index];
            final isSelected = _selectedItem?.id == item.id;

            return AppProductItemCard(
              isSelected: isSelected,
              onTap: () => setState(() => _selectedItem = item),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Electricity',
                    style: TextStyle(
                      color: AppColors.brand500.withValues(alpha: 0.4),
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    NumberFormat.decimalPattern('id_ID').format(
                      int.tryParse(item.name.replaceAll(RegExp(r'\D'), '')) ??
                          0,
                    ),
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: AppColors.brand500.withValues(alpha: 0.9),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.ocean500.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      _formatPrice(item.price),
                      style: const TextStyle(
                        color: AppColors.ocean500,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildFooter() {
    return AppStickyFooter(
      label: 'SUBTOTAL',
      value: _selectedItem != null ? _formatPrice(_selectedItem!.price) : 'Rp. -',
      buttonLabel: 'Buy Now',
      onButtonPressed: _canProceed ? _handleBuyNow : null,
    );
  }

  void _handleBuyNow() {
    final Map<String, dynamic> customerData = {};
    _controllers.forEach((key, controller) {
      customerData[key] = controller.text;
    });

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => CheckoutScreen(
          product: _product!,
          item: _selectedItem!,
          customerData: customerData,
          targetLabel: 'No. Meter',
          itemPrefix: 'PLN Token',
        ),
      ),
    );
  }
}
