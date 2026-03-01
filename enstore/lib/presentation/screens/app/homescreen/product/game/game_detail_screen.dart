import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../../../../core/models/product.dart';
import '../../../../../../core/models/product_item.dart';
import '../../../../../../core/theme/app_colors.dart';
import '../../../../../../core/network/api_client.dart';
import '../../../../../../core/services/product_service.dart';
import '../../../../../widgets/layout/app_sticky_footer.dart';
import '../../../../../widgets/layout/app_app_bar.dart';
import '../../../../../widgets/inputs/app_product_input_form.dart';
import '../../../../../widgets/cards/app_product_item_card.dart';
import '../../checkout/checkout_screen.dart';
import '../../../../../widgets/feedback/app_toast.dart';

class GameDetailScreen extends StatefulWidget {
  final Product product;
  const GameDetailScreen({super.key, required this.product});

  @override
  State<GameDetailScreen> createState() => _GameDetailScreenState();
}

class _GameDetailScreenState extends State<GameDetailScreen> {
  ProductItem? _selectedItem;
  final Map<String, TextEditingController> _controllers = {};
  final Map<String, dynamic> _formValues = {};
  bool _isFavorite = false;
  bool _isLoading = true;
  Product? _detailedProduct;

  @override
  void initState() {
    super.initState();
    if (widget.product.inputFields != null) {
      for (var field in widget.product.inputFields!) {
        final key = field['name'] ?? field['label'] ?? '';
        final type = field['type'] ?? 'text';

        if (type == 'select') {
          _formValues[key] = null;
        } else {
          _controllers[key] = TextEditingController();
        }
      }
    }
    _fetchProductDetail();
  }

  bool get _canProceed {
    if (_selectedItem == null) return false;

    if (widget.product.inputFields != null) {
      for (var field in widget.product.inputFields!) {
        final key = field['name'] ?? field['label'] ?? '';
        final isRequired = field['required'] == true;
        if (!isRequired) continue;

        final type = field['type'] ?? 'text';
        if (type == 'select') {
          if (_formValues[key] == null || _formValues[key].toString().isEmpty) {
            return false;
          }
        } else {
          if (_controllers[key] == null || _controllers[key]!.text.isEmpty) {
            return false;
          }
        }
      }
    }
    return true;
  }

  Future<void> _fetchProductDetail() async {
    final apiClient = ApiClient();
    final productService = ProductService(apiClient);

    try {
      final response = await productService.getProductById(widget.product.id);
      if (mounted) {
        setState(() {
          if (response.success && response.data != null) {
            _detailedProduct = response.data;
          }
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        AppToast.error(context, 'Failed to load product details: $e');
      }
    }
  }

  @override
  void dispose() {
    for (var controller in _controllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  String _formatPrice(int price) {
    return NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp. ',
      decimalDigits: 0,
    ).format(price);
  }

  @override
  Widget build(BuildContext context) {
    String imageUrl = widget.product.image ?? '';
    if (imageUrl.isNotEmpty && !imageUrl.startsWith('http')) {
      imageUrl =
          '${ApiClient.baseUrl.replaceAll('/api', '')}/storage/$imageUrl';
    }

    return Scaffold(
      backgroundColor: AppColors.smoke200,
      appBar: AppAppBar(
        title: 'Product Detail',
        actions: [
          AppAppBarButton(
            icon: _isFavorite
                ? Icons.favorite_rounded
                : Icons.favorite_border_rounded,
            iconColor: _isFavorite ? Colors.redAccent : null,
            onPressed: () => setState(() => _isFavorite = !_isFavorite),
          ),
        ],
      ),
      body: Stack(
        children: [
          // Scrollable Content
          SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.only(bottom: 120),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Product Banner & Card
                _buildProductHeader(imageUrl),

                // Nominal Selection Section
                _buildNominalSelection(),
              ],
            ),
          ),

          // Sticky Bottom Bar
          Align(alignment: Alignment.bottomCenter, child: _buildStickyFooter()),
        ],
      ),
    );
  }

  Widget _buildProductHeader(String imageUrl) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.smoke200,
          borderRadius: BorderRadius.circular(40),
          border: Border.all(color: AppColors.brand500.withValues(alpha: 0.05)),
        ),
        child: Column(
          children: [
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.all(Radius.circular(24)),
                  child: AspectRatio(
                    aspectRatio: 16 / 9,
                    child: Container(
                      foregroundDecoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.transparent,
                            AppColors.brand500.withValues(alpha: 0.6),
                          ],
                        ),
                      ),
                      child: imageUrl.isNotEmpty
                          ? Image.network(imageUrl, fit: BoxFit.cover)
                          : const Icon(Icons.sports_esports_rounded, size: 64),
                    ),
                  ),
                ),

                Positioned.fill(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.product.name,
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: AppColors.cloud200.withValues(alpha: 0.9),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          widget.product.publisher ?? 'Publisher',
                          style: TextStyle(
                            fontSize: 14,
                            color: AppColors.cloud200.withValues(alpha: 0.6),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),

            // Dynamic Input Form
            if (widget.product.inputFields != null &&
                widget.product.inputFields!.isNotEmpty)
              _buildDynamicForm(),
          ],
        ),
      ),
    );
  }

  Widget _buildDynamicForm() {
    if (widget.product.inputFields == null) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        AppProductInputForm(
          fields: widget.product.inputFields!,
          controllers: _controllers,
          formValues: _formValues,
          onFieldChanged: (key, val) {
            if (_formValues.containsKey(key)) {
              setState(() => _formValues[key] = val);
            }
            setState(() {});
          },
          padding: const EdgeInsets.only(top: 24),
        ),

        const SizedBox(height: 16),

        // Help tip
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Row(
            children: [
              const Icon(
                Icons.lightbulb_rounded,
                color: AppColors.ocean500,
                size: 16,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'To find your ID, open the game and tap your profile picture. Your ID will be displayed next to your name.',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.brand500.withValues(alpha: 0.6),
                    height: 1.4,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildNominalSelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(top: 32, left: 24, right: 24),
          child: Text(
            'Select Nominal',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppColors.brand500.withValues(alpha: 0.9),
            ),
          ),
        ),
        const SizedBox(height: 24),
        if (_isLoading)
          const Center(
            child: Padding(
              padding: EdgeInsets.all(32.0),
              child: CircularProgressIndicator(color: AppColors.ocean500),
            ),
          )
        else
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 24),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.96,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
            ),
            itemCount: _detailedProduct?.items.length ?? 0,
            itemBuilder: (context, index) {
              final item = _detailedProduct!.items[index];
              final isSelected = _selectedItem?.id == item.id;

              return AppProductItemCard(
                isSelected: isSelected,
                onTap: () => setState(() => _selectedItem = item),
                padding: const EdgeInsets.all(16),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.ocean500.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: AppColors.ocean500.withValues(alpha: 0.2),
                        ),
                      ),
                      child: Icon(
                        Icons.diamond_rounded,
                        color: AppColors.ocean500,
                        size: 24,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      item.name,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppColors.brand500.withValues(alpha: 0.9),
                      ),
                      textAlign: TextAlign.center,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _formatPrice(item.price),
                      style: TextStyle(
                        fontSize: 14,
                        color: AppColors.brand500.withValues(alpha: 0.6),
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

  Widget _buildStickyFooter() {
    return AppStickyFooter(
      label: 'SUBTOTAL',
      value: _selectedItem != null
          ? _formatPrice(_selectedItem!.price)
          : 'Rp. -',
      buttonLabel: 'Buy Now',
      onButtonPressed: _canProceed ? _handleBuyNow : null,
    );
  }

  void _handleBuyNow() {
    final Map<String, dynamic> customerData = Map.from(_formValues);
    _controllers.forEach((key, controller) {
      if (controller.text.isNotEmpty) {
        customerData[key] = controller.text;
      }
    });

    // Check if all required fields are filled (simplified check)
    if (widget.product.inputFields != null) {
      for (var field in widget.product.inputFields!) {
        final key = field['name'] ?? field['label'] ?? '';
        if (field['required'] == true &&
            (customerData[key] == null ||
                customerData[key].toString().isEmpty)) {
          AppToast.warning(context, 'Please fill in ${field['label'] ?? key}');
          return;
        }
      }
    }

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => CheckoutScreen(
          product: _detailedProduct ?? widget.product,
          item: _selectedItem!,
          customerData: customerData,
        ),
      ),
    );
  }
}
