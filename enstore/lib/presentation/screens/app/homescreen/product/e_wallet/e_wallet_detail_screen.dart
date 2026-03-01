import 'package:flutter/material.dart';
import '../../../../../../core/models/product.dart';
import '../../../../../../core/models/product_item.dart';
import '../../../../../../core/theme/app_colors.dart';
import '../../../../../../core/network/api_client.dart';
import '../../../../../../core/services/product_service.dart';
import '../../../../../widgets/layout/app_sticky_footer.dart';
import '../../../../../widgets/layout/app_app_bar.dart';
import '../../../../../widgets/inputs/app_product_input_form.dart';
import '../../../../../widgets/inputs/app_contact_picker.dart';
import '../../../../../widgets/cards/app_product_item_card.dart';
import '../../checkout/checkout_screen.dart';
import '../../../../../widgets/feedback/app_toast.dart';
import 'package:intl/intl.dart';
import '../../../../../../core/helpers/string_helper.dart';

class EWalletDetailScreen extends StatefulWidget {
  final Product product;
  const EWalletDetailScreen({super.key, required this.product});

  @override
  State<EWalletDetailScreen> createState() => _EWalletDetailScreenState();
}

class _EWalletDetailScreenState extends State<EWalletDetailScreen> {
  ProductItem? _selectedItem;
  final Map<String, TextEditingController> _controllers = {};
  final Map<String, dynamic> _formValues = {};
  bool _isLoading = true;
  Product? _detailedProduct;
  String? _selectedGroup;
  Map<String, List<ProductItem>> _groupedItems = {};

  @override
  void initState() {
    super.initState();
    _initializeForm();
    _fetchProductDetail();
  }

  void _initializeForm() {
    final fields = _detailedProduct?.inputFields ?? widget.product.inputFields;
    if (fields != null) {
      for (var field in fields) {
        final key = (field['name'] ?? field['label'] ?? '').toString();
        final type = field['type'] ?? 'text';
        if (type == 'select') {
          _formValues[key] = null;
        } else if (!_controllers.containsKey(key)) {
          _controllers[key] = TextEditingController();
        }
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

  Future<void> _fetchProductDetail() async {
    final apiClient = ApiClient();
    final productService = ProductService(apiClient);

    try {
      final response = await productService.getProductById(widget.product.id);
      if (mounted) {
        setState(() {
          if (response.success && response.data != null) {
            _detailedProduct = response.data;
            _initializeForm();
            _groupItems();
          }
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        AppToast.error(context, 'Failed to load product details: $e');
      }
    }
  }

  void _groupItems() {
    if (_detailedProduct == null) return;
    _groupedItems = {};
    for (var item in _detailedProduct!.items) {
      final groupName = item.group ?? 'Default';
      if (!_groupedItems.containsKey(groupName)) {
        _groupedItems[groupName] = [];
      }
      _groupedItems[groupName]!.add(item);
    }

    if (_groupedItems.isNotEmpty) {
      _selectedGroup = _groupedItems.keys.first;
    }
  }

  String _formatPrice(int price) {
    return NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp. ',
      decimalDigits: 0,
    ).format(price);
  }

  String _formatNominal(String itemName) {
    final digits = itemName.replaceAll(RegExp(r'\D'), '');
    final number = int.tryParse(digits) ?? 0;
    if (number == 0) return itemName;
    return NumberFormat.decimalPattern('id_ID').format(number);
  }

  Future<void> _pickContact(String controllerKey) async {
    await AppContactPicker.show(context, (phone) {
      setState(() {
        final controller = _controllers.putIfAbsent(controllerKey, () => TextEditingController());
        controller.text = phone;
        _formValues[controllerKey] = phone;
      });
    });
  }

  bool get _canProceed {
    if (_selectedItem == null) return false;
    final fields = _detailedProduct?.inputFields ?? widget.product.inputFields;
    if (fields != null) {
      for (var field in fields) {
        final key = (field['name'] ?? field['label'] ?? '').toString();
        if (field['required'] == true) {
          if (field['type'] == 'select') {
            if (_formValues[key] == null || _formValues[key].toString().isEmpty) return false;
          } else {
            if (_controllers[key]?.text.isEmpty ?? true) return false;
          }
        }
      }
    }
    return true;
  }

  void _handleBuyNow() {
    final Map<String, dynamic> customerData = Map.from(_formValues);
    _controllers.forEach((key, controller) {
      if (controller.text.isNotEmpty) {
        customerData[key] = controller.text;
      }
    });

    final fields = _detailedProduct?.inputFields ?? widget.product.inputFields;
    if (fields != null) {
      for (var field in fields) {
        final key = (field['name'] ?? field['label'] ?? '').toString();
        if (field['required'] == true &&
            (customerData[key] == null || customerData[key].toString().isEmpty)) {
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
          targetLabel: 'Nomor HP / ID',
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.smoke200,
      appBar: AppAppBar(title: widget.product.name),
      body: Stack(
        children: [
          SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.only(bottom: 120),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if ((_detailedProduct?.inputFields ?? widget.product.inputFields) != null &&
                    (_detailedProduct?.inputFields ?? widget.product.inputFields)!.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: _buildInputForm(),
                  ),
                if (_groupedItems.length > 1) _buildGroupTabs(),
                _buildNominalSelection(),
              ],
            ),
          ),
          Align(alignment: Alignment.bottomCenter, child: _buildStickyFooter()),
        ],
      ),
    );
  }

  Widget _buildGroupTabs() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.cloud200,
        borderRadius: BorderRadius.circular(32),
      ),
      child: Row(
        children: _groupedItems.keys.map((group) {
          final isSelected = _selectedGroup == group;
          return Expanded(
            child: GestureDetector(
              onTap: () => setState(() {
                _selectedGroup = group;
                if (_selectedItem != null && _selectedItem!.group != group) {
                  _selectedItem = null;
                }
              }),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.smoke50 : Colors.transparent,
                  borderRadius: BorderRadius.circular(28),
                ),
                alignment: Alignment.center,
                child: Text(
                  group.capitalize(),
                  style: TextStyle(
                    color: isSelected ? AppColors.ocean500 : AppColors.brand500.withOpacity(0.4),
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildNominalSelection() {
    final items = _selectedGroup != null ? _groupedItems[_selectedGroup!] : (_detailedProduct?.items ?? []);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(top: 16, left: 24, right: 24),
          child: Text('Select Nominal',
              style: TextStyle(
                  fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.brand500.withOpacity(0.9))),
        ),
        const SizedBox(height: 16),
        if (_isLoading)
          const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator(color: AppColors.ocean500)))
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
            itemCount: items?.length ?? 0,
            itemBuilder: (context, index) {
              final item = items![index];
              final isSelected = _selectedItem?.id == item.id;
              final groupName = (_groupedItems.length > 1) ? _selectedGroup?.capitalize() : '';
              return AppProductItemCard(
                isSelected: isSelected,
                onTap: () => setState(() => _selectedItem = item),
                padding: const EdgeInsets.all(16),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('${widget.product.name} $groupName',
                        style: TextStyle(fontSize: 12, color: AppColors.brand500.withOpacity(0.4)),
                        textAlign: TextAlign.center, maxLines: 1, overflow: TextOverflow.ellipsis),
                    const SizedBox(height: 4),
                    Text(_formatNominal(item.name),
                        style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.brand500.withOpacity(0.9)),
                        textAlign: TextAlign.center, maxLines: 1, overflow: TextOverflow.ellipsis),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                          color: AppColors.ocean500.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(99),
                          border: Border.all(color: AppColors.ocean500.withOpacity(0.2))),
                      child: Text(_formatPrice(item.price),
                          style: const TextStyle(color: AppColors.ocean500, fontSize: 12, fontWeight: FontWeight.bold)),
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
      value: _selectedItem != null ? _formatPrice(_selectedItem!.price) : 'Rp. -',
      buttonLabel: 'Buy Now',
      onButtonPressed: _canProceed ? _handleBuyNow : null,
    );
  }

  Widget _buildInputForm() {
    final fields = _detailedProduct?.inputFields ?? widget.product.inputFields ?? [];
    final Map<String, Widget> dynamicPrefixes = {};
    final Map<String, Widget> dynamicSuffixes = {};

    for (var field in fields) {
      final key = (field['name'] ?? field['label'] ?? '').toString();
      final lowerKey = key.toLowerCase();
      final label = (field['label'] ?? '').toString().toLowerCase();

      bool isPhoneField = lowerKey.contains('phone') || lowerKey.contains('number') || lowerKey.contains('telp') ||
          lowerKey.contains('hp') || label.contains('hp') || label.contains('telepon') ||
          label.contains('nomer') || label.contains('nomor') || label.contains('number');

      if (isPhoneField) {
        dynamicPrefixes[key] = const Icon(Icons.phone_android_rounded);
        dynamicSuffixes[key] = IconButton(
          icon: const Icon(Icons.contact_page_rounded),
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(),
          onPressed: () => _pickContact(key),
        );
      } else if (lowerKey.contains('id') || lowerKey.contains('user') || lowerKey.contains('target') ||
          label.contains('id') || label.contains('tujuan') || label.contains('user')) {
        dynamicPrefixes[key] = const Icon(Icons.person_outline_rounded);
      }
    }

    return AppProductInputForm(
      fields: fields,
      controllers: _controllers,
      formValues: _formValues,
      prefixIcons: dynamicPrefixes,
      suffixIcons: dynamicSuffixes,
      onFieldChanged: (key, val) {
        if (_formValues.containsKey(key)) setState(() => _formValues[key] = val);
        setState(() {});
      },
      padding: EdgeInsets.zero,
    );
  }
}
