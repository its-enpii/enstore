import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_contacts/flutter_contacts.dart';
import 'package:intl/intl.dart';
import 'package:permission_handler/permission_handler.dart';

import '../../../../../../core/models/product.dart';
import '../../../../../../core/models/product_item.dart';
import '../../../../../../core/theme/app_colors.dart';
import '../../../../../../core/network/api_client.dart';
import '../../../../../../core/services/product_service.dart';
import '../../../../../../core/helpers/phone_helper.dart';
import '../../../../../widgets/layout/app_sticky_footer.dart';
import '../../../../../widgets/layout/app_app_bar.dart';
import '../../../../../widgets/feedback/app_toast.dart';
import '../../../../../widgets/inputs/app_product_input_form.dart';
import '../../../../../widgets/cards/app_product_item_card.dart';
import '../../checkout/checkout_screen.dart';

class DataScreen extends StatefulWidget {
  const DataScreen({super.key});

  @override
  State<DataScreen> createState() => _DataScreenState();
}

class _DataScreenState extends State<DataScreen> {
  final Map<String, TextEditingController> _controllers = {};
  Product? _detectedProduct;
  ProductItem? _selectedItem;
  bool _isLoadingProduct = false;
  String? _providerName;
  String? _providerCode;
  Timer? _debounce;

  TextEditingController get _primaryController {
    if (_controllers.containsKey('phone')) return _controllers['phone']!;
    if (_controllers.isNotEmpty) return _controllers.values.first;
    return TextEditingController();
  }

  @override
  void initState() {
    super.initState();
    _controllers['phone'] = TextEditingController();
  }

  @override
  void dispose() {
    for (var controller in _controllers.values) {
      controller.dispose();
    }
    _debounce?.cancel();
    super.dispose();
  }

  void _handleFieldChanged(String key, String value) {
    if (_debounce?.isActive ?? false) _debounce?.cancel();

    bool shouldLookup =
        key == 'phone' ||
        key == 'telepon' ||
        key.contains('number') ||
        _controllers.length == 1;

    if (shouldLookup) {
      final provider = PhoneHelper.getProvider(value);

      if (provider != null) {
        final code = provider['code']!;
        final name = provider['name']!;

        if (code != _providerCode || _detectedProduct == null) {
          setState(() {
            _providerCode = code;
            _providerName = name;
          });

          _debounce = Timer(const Duration(milliseconds: 300), () {
            _fetchProductByProvider(name);
          });
        }
      } else if (value.length >= 4) {
        setState(() {
          _providerName = 'Unknown Provider';
          _detectedProduct = null;
          _providerCode = null;
        });
      } else if (value.isEmpty) {
        setState(() {
          _detectedProduct = null;
          _providerName = null;
          _providerCode = null;
          _selectedItem = null;
        });
      }
    }

    setState(() {});
  }

  Future<void> _fetchProductByProvider(String providerName) async {
    final apiClient = ApiClient();
    final productService = ProductService(apiClient);

    setState(() => _isLoadingProduct = true);

    try {
      final response = await productService.getProducts(
        filters: {'brand': providerName, 'category': 'data'},
      );

      if (mounted) {
        if (response.success &&
            response.data != null &&
            response.data!.data.isNotEmpty) {
          final firstProduct = response.data!.data.first;
          final detailResponse = await productService.getProductById(
            firstProduct.id,
          );

          if (mounted) {
            setState(() {
              if (detailResponse.success) {
                _detectedProduct = detailResponse.data;
              } else {
                _detectedProduct = null;
                AppToast.warning(
                  context,
                  'Products not found for $providerName',
                );
              }
            });
          }
        } else {
          setState(() {
            _detectedProduct = null;
            AppToast.warning(context, 'Products not found for $providerName');
          });
        }
      }
    } catch (e) {
      if (mounted) {
        AppToast.error(context, 'Failed to load packages: $e');
      }
    } finally {
      if (mounted) {
        setState(() => _isLoadingProduct = false);
      }
    }
  }

  Future<void> _pickContact() async {
    if (await Permission.contacts.request().isGranted) {
      final contact = await FlutterContacts.openExternalPick();
      if (contact != null && contact.phones.isNotEmpty) {
        String phone = contact.phones.first.number.replaceAll(
          RegExp(r'\D'),
          '',
        );
        if (phone.startsWith('62')) {
          phone = '0${phone.substring(2)}';
        }
        _primaryController.text = phone;
        _handleFieldChanged('phone', phone);
      }
    } else {
      if (mounted) {
        AppToast.warning(context, 'Permission to access contacts denied');
      }
    }
  }

  bool get _canProceed {
    if (_selectedItem == null) return false;
    if (_primaryController.text.isEmpty) return false;

    if (_detectedProduct?.inputFields != null) {
      for (var field in _detectedProduct!.inputFields!) {
        final key = field['name'] ?? field['label'] ?? '';
        final isRequired = field['required'] == true;
        if (isRequired &&
            (_controllers[key] == null || _controllers[key]!.text.isEmpty)) {
          return false;
        }
      }
    }
    return true;
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
    return Scaffold(
      backgroundColor: AppColors.smoke200,
      appBar: const AppAppBar(title: 'Paket Data'),
      body: Stack(
        children: [
          SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(24, 0, 24, 120),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildDynamicInputs(),
                if (_providerName != null) _buildProviderBadge(),
                const SizedBox(height: 24),
                _buildNominalSelection(),
              ],
            ),
          ),
          Align(alignment: Alignment.bottomCenter, child: _buildStickyFooter()),
        ],
      ),
    );
  }

  Widget _buildDynamicInputs() {
    final fields =
        _detectedProduct?.inputFields ??
        [
          {
            'name': 'phone',
            'label': 'Nomor HP',
            'placeholder': '628...',
            'type': 'tel',
            'required': true,
          },
        ];

    return AppProductInputForm(
      fields: fields,
      controllers: _controllers,
      formValues: const {},
      prefixIcons: {'phone': const Icon(Icons.search_rounded)},
      suffixIcons: {
        'phone': IconButton(
          icon: const Icon(Icons.contact_page_rounded),
          onPressed: _pickContact,
        ),
      },
      onFieldChanged: _handleFieldChanged,
      padding: EdgeInsets.zero,
    );
  }

  Widget _buildProviderBadge() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.ocean500.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        _providerName!,
        style: const TextStyle(
          color: AppColors.ocean500,
          fontWeight: FontWeight.bold,
          fontSize: 12,
        ),
      ),
    );
  }

  Widget _buildNominalSelection() {
    if (_isLoadingProduct) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(40),
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (_detectedProduct == null) {
      return Column(
        children: [
          const SizedBox(height: 40),
          Center(
            child: Icon(
              Icons.language_rounded,
              size: 64,
              color: AppColors.brand500.withValues(alpha: 0.1),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Enter phone number to see packages',
            style: TextStyle(color: AppColors.brand500.withValues(alpha: 0.4)),
          ),
        ],
      );
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
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: _detectedProduct!.items.length,
          separatorBuilder: (context, index) => const SizedBox(height: 8),
          itemBuilder: (context, index) {
            final item = _detectedProduct!.items[index];
            final isSelected = _selectedItem?.id == item.id;

            return AppProductItemCard(
              isSelected: isSelected,
              onTap: () => setState(() => _selectedItem = item),
              padding: const EdgeInsets.all(24),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item.name,
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: AppColors.brand500.withValues(alpha: 0.9),
                          ),
                        ),
                        if (item.description != null || item.group != null) ...[
                          const SizedBox(height: 4),
                          Text(
                            item.description ?? item.group ?? '',
                            style: TextStyle(
                              color: AppColors.brand500.withValues(alpha: 0.4),
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),

                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.ocean500.withValues(alpha: 0.1),
                      border: BoxBorder.all(
                        color: AppColors.ocean500.withValues(alpha: 0.2),
                      ),
                      borderRadius: BorderRadius.circular(99),
                    ),
                    child: Text(
                      _formatPrice(item.price),
                      style: const TextStyle(
                        color: AppColors.ocean500,
                        fontSize: 14,
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
    final Map<String, dynamic> customerData = {};
    _controllers.forEach((key, controller) {
      customerData[key] = controller.text;
    });

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => CheckoutScreen(
          product: _detectedProduct!,
          item: _selectedItem!,
          customerData: customerData,
          targetLabel: 'Nomor',
          itemPrefix: null,
        ),
      ),
    );
  }
}
