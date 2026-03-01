import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import 'payment_screen.dart';
import '../../../../../core/models/product.dart';

import '../../../../../core/models/product_item.dart';
import '../../../../../core/models/transaction.dart';
import '../../../../../core/network/api_client.dart';
import '../../../../../core/services/transaction_service.dart';
import '../../../../../core/services/auth_service.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../widgets/layout/app_sticky_footer.dart';
import '../../../../widgets/layout/app_app_bar.dart';
import '../../../../widgets/feedback/app_toast.dart';
import '../../../../widgets/feedback/app_dialog.dart';
import '../../../../widgets/feedback/app_skeleton.dart';

class CheckoutScreen extends StatefulWidget {
  final Product product;
  final ProductItem item;
  final Map<String, dynamic> customerData;
  final String targetLabel;
  final String? itemPrefix;

  const CheckoutScreen({
    super.key,
    required this.product,
    required this.item,
    required this.customerData,
    this.targetLabel = 'Target / ID',
    this.itemPrefix,
  });

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  List<PaymentChannel> _paymentChannels = [];
  bool _isLoading = true;
  PaymentChannel? _selectedChannel;

  @override
  void initState() {
    super.initState();
    _fetchPaymentChannels();
  }

  Future<void> _fetchPaymentChannels() async {
    final apiClient = ApiClient();
    final transactionService = TransactionService(apiClient);

    try {
      final response = await transactionService.getPaymentChannels();
      if (mounted) {
        setState(() {
          if (response.success) {
            _paymentChannels = response.data ?? [];
            // Auto select first channel if available
            if (_paymentChannels.isNotEmpty) {
              _selectedChannel = _paymentChannels.first;
            }
          }
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        AppToast.error(context, 'Failed to load payment methods: $e');
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

  /// Mengekstrak angka dari nama item dan memformatnya sebagai nominal.
  /// Contoh: 'XL Axiata 50000' → '50.000'
  String _formatNominal(String itemName) {
    final digits = itemName.replaceAll(RegExp(r'\D'), '');
    final number = int.tryParse(digits) ?? 0;
    if (number == 0) return itemName;
    return NumberFormat.decimalPattern('id_ID').format(number);
  }

  int _calculateFee(PaymentChannel channel) {
    double percentFee = widget.item.price * (channel.feePercent / 100);
    return channel.feeFlat + percentFee.ceil();
  }

  int _calculateTotal() {
    if (_selectedChannel == null) return widget.item.price;
    return widget.item.price + _calculateFee(_selectedChannel!);
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
      appBar: const AppAppBar(title: 'Checkout'),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.only(bottom: 120),
            physics: const BouncingScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildProductSummaryCard(imageUrl),
                const SizedBox(height: 32),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Text(
                    'Payment Method',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: AppColors.brand500.withValues(alpha: 0.9),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                if (_isLoading)
                  AppShimmer(
                    child: ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: 4,
                      itemBuilder: (context, index) {
                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                              child: Row(
                                children: [
                                  const AppSkeletonCircle(size: 16),
                                  const SizedBox(width: 8),
                                  const AppSkeleton(height: 12, width: 80),
                                ],
                              ),
                            ),
                            Container(
                              margin: const EdgeInsets.only(left: 24, right: 24, bottom: 8),
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: AppColors.cloud200,
                                borderRadius: BorderRadius.circular(24),
                              ),
                              child: const Row(
                                children: [
                                  AppSkeleton(height: 48, width: 48, borderRadius: 16),
                                  SizedBox(width: 16),
                                  Expanded(
                                    child: AppSkeleton(height: 16, width: 120),
                                  ),
                                  SizedBox(width: 16),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      AppSkeleton(height: 10, width: 30),
                                      SizedBox(height: 4),
                                      AppSkeleton(height: 14, width: 60),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                  )
                else
                  _buildPaymentMethodList(),
              ],
            ),
          ),
          Align(alignment: Alignment.bottomCenter, child: _buildStickyFooter()),
        ],
      ),
    );
  }

  Widget _buildProductSummaryCard(String imageUrl) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColors.smoke200,
          borderRadius: BorderRadius.circular(48),
          border: Border.all(color: AppColors.brand500.withValues(alpha: 0.05)),
        ),
        child: Row(
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(24),
                image: imageUrl.isNotEmpty
                    ? DecorationImage(
                        image: NetworkImage(imageUrl),
                        fit: BoxFit.cover,
                      )
                    : null,
                color: AppColors.cloud200,
              ),
              child: imageUrl.isEmpty
                  ? Icon(
                      Icons.image_not_supported_rounded,
                      color: AppColors.brand500.withValues(alpha: 0.9),
                    )
                  : null,
            ),

            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.product.name,
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.brand500.withValues(alpha: 0.6),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    widget.item.name,
                    style: TextStyle(
                      fontSize: 20,
                      color: AppColors.brand500.withValues(alpha: 0.9),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _formatPrice(widget.item.price),
                    style: TextStyle(
                      fontSize: 16,
                      color: AppColors.ocean500,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentMethodList() {
    // Group payment channels
    final Map<String, List<PaymentChannel>> groups = {};
    for (var channel in _paymentChannels) {
      if (!groups.containsKey(channel.group)) {
        groups[channel.group] = [];
      }
      groups[channel.group]!.add(channel);
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: groups.length,
      itemBuilder: (context, index) {
        final groupName = groups.keys.elementAt(index);
        final channels = groups[groupName]!;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              child: Row(
                children: [
                  Icon(
                    groupName.toLowerCase().contains('wallet')
                        ? Icons.account_balance_wallet_rounded
                        : Icons.account_balance_rounded,
                    size: 16,
                    color: AppColors.brand500.withValues(alpha: 0.4),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    groupName.toUpperCase(),
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.2,
                      color: AppColors.brand500.withValues(alpha: 0.4),
                    ),
                  ),
                ],
              ),
            ),
            ...channels.map((channel) => _buildPaymentChannelItem(channel)),
            const SizedBox(height: 16),
          ],
        );
      },
    );
  }

  Widget _buildPaymentChannelItem(PaymentChannel channel) {
    final isSelected = _selectedChannel?.code == channel.code;
    return GestureDetector(
      onTap: () => setState(() => _selectedChannel = channel),
      child: Container(
        margin: const EdgeInsets.only(left: 24, right: 24, bottom: 8),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.ocean500.withValues(alpha: 0.05)
              : AppColors.smoke200,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: isSelected
                ? AppColors.ocean500
                : AppColors.brand500.withValues(alpha: 0.05),
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: isSelected ? AppColors.ocean500 : AppColors.cloud200,
                borderRadius: BorderRadius.circular(16),
              ),
              alignment: Alignment.center,
              child: Text(
                channel.code.length >= 3
                    ? channel.code.substring(0, 3)
                    : channel.code,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: isSelected ? AppColors.smoke200 : AppColors.ocean500,
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                channel.name
                    .replaceAll('Virtual Account', 'VA')
                    .replaceAll('(Customizable)', '')
                    .trim(),
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.brand500.withValues(alpha: 0.9),
                ),
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  'Fee',
                  style: TextStyle(
                    fontSize: 10,
                    color: AppColors.brand500.withValues(alpha: 0.4),
                  ),
                ),
                Text(
                  _formatPrice(_calculateFee(channel)),
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppColors.ocean500,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStickyFooter() {
    int total = _calculateTotal();

    return AppStickyFooter(
      label: 'TOTAL',
      value: _formatPrice(total),
      buttonLabel: 'Pay Now',
      onButtonPressed: _selectedChannel == null ? null : _processPayment,
    );
  }

  Future<void> _processPayment() async {
    final fee = _calculateFee(_selectedChannel!);
    final total = _calculateTotal();

    // Get target info (like User ID) from customerData
    String target = '';
    if (widget.customerData.containsKey('user_id')) {
      target = widget.customerData['user_id'].toString();
      if (widget.customerData.containsKey('zone_id')) {
        target += ' (${widget.customerData['zone_id']})';
      }
    } else if (widget.customerData.isNotEmpty) {
      target = widget.customerData.values.first.toString();
    }

    AppDialog.show(
      context,
      type: AppDialogType.question,
      title: 'Konfirmasi Pesanan',
      confirmLabel: 'Lanjutkan',
      cancelLabel: 'Batal',
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 32),
          _buildConfirmationRow(widget.targetLabel, target),
          _buildConfirmationRow(
            'Item',
            widget.itemPrefix != null
                ? '${widget.itemPrefix} ${_formatNominal(widget.item.name)}'
                : widget.item.name,
          ),
          const SizedBox(height: 16),
          Divider(height: 1, color: AppColors.brand500.withValues(alpha: 0.05)),
          const SizedBox(height: 16),
          _buildConfirmationRow('Subtotal', _formatPrice(widget.item.price)),
          _buildConfirmationRow('Biaya Admin', _formatPrice(fee)),
          const SizedBox(height: 16),
          Divider(height: 1, color: AppColors.brand500.withValues(alpha: 0.05)),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Total',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.brand500.withValues(alpha: 0.9),
                ),
              ),
              Text(
                _formatPrice(total),
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppColors.ocean500,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Pastikan data yang Anda masukkan benar.',
            style: TextStyle(
              fontSize: 12,
              color: AppColors.brand500.withValues(alpha: 0.4),
            ),
          ),
        ],
      ),
      onConfirm: () async {
        final success = await _startTransaction();
        if (!success && context.mounted) {
          Navigator.pop(context); // Only close on failure to allow retry
        }
      },
    );
  }

  Widget _buildConfirmationRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 14,
              color: AppColors.brand500.withValues(alpha: 0.4),
            ),
          ),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: AppColors.brand500.withValues(alpha: 0.9),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<bool> _startTransaction() async {
    setState(() => _isLoading = true);

    try {
      final apiClient = ApiClient();
      final transactionService = TransactionService(apiClient);

      // Construct purchase data matching ProductDetailClient.tsx
      final Map<String, dynamic> purchaseData = {
        'product_item_id': widget.item.id,
        'payment_method': _selectedChannel!.code,
        'customer_data': widget.customerData,
      };

      // Add optional top-level fields only if they have values
      final email =
          widget.customerData['email'] ?? widget.customerData['customer_email'];
      if (email != null && email.toString().isNotEmpty) {
        purchaseData['customer_email'] = email.toString();
      }

      final name =
          widget.customerData['name'] ?? widget.customerData['customer_name'];
      if (name != null && name.toString().isNotEmpty) {
        purchaseData['customer_name'] = name.toString();
      }

      final phone =
          widget.customerData['phone'] ?? widget.customerData['customer_phone'];
      if (phone != null && phone.toString().isNotEmpty) {
        purchaseData['customer_phone'] = phone.toString();
      }

      final authService = AuthService(apiClient);
      final isLoggedIn = await authService.isLoggedIn();

      final response = isLoggedIn
          ? await transactionService.customerPurchase(purchaseData)
          : await transactionService.guestPurchase(purchaseData);

      if (mounted) {
        setState(() => _isLoading = false);
        if (response.success && response.data != null) {
          final transactionCode =
              response.data!.transaction['transaction_code'] ??
              response.data!.transaction['reference'];

          if (mounted) {
            // First pop the confirmation dialog
            Navigator.pop(context);

            // Then navigate to payment screen
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(
                builder: (context) =>
                    PaymentScreen(transactionCode: transactionCode),
              ),
            );
          }
          return true;
        } else {
          AppToast.error(context, response.message);
          return false;
        }
      }
      return false;
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        String errorMessage = e.toString();

        if (e is DioException) {
          final data = e.response?.data;
          if (data is Map && data.containsKey('message')) {
            errorMessage = data['message'];
          } else if (e.type == DioExceptionType.connectionTimeout) {
            errorMessage = 'Connection timeout. Please check your internet.';
          }
        }

        AppToast.error(context, errorMessage);
      }
      return false;
    }
  }
}
