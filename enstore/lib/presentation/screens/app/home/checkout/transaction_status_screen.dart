import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../../core/models/transaction.dart';
import '../../../../../core/theme/app_colors.dart';
import '../../../../widgets/buttons/app_button.dart';
import '../../../../widgets/layout/app_app_bar.dart';
import '../../../../widgets/feedback/app_toast.dart';
import '../../../../widgets/feedback/app_skeleton.dart';
import '../../main_screen.dart';

import '../../../../../core/network/api_client.dart';
import '../../../../../core/services/transaction_service.dart';

class TransactionStatusScreen extends StatefulWidget {
  final TransactionStatusModel? transaction;
  final String? transactionCode;

  const TransactionStatusScreen({
    super.key,
    this.transaction,
    this.transactionCode,
  }) : assert(transaction != null || transactionCode != null);

  @override
  State<TransactionStatusScreen> createState() =>
      _TransactionStatusScreenState();
}

class _TransactionStatusScreenState extends State<TransactionStatusScreen> {
  late final TransactionService _transactionService;
  TransactionStatusModel? _data;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _transactionService = TransactionService(ApiClient());
    if (widget.transaction != null) {
      _data = widget.transaction;
      _isLoading = false;
    } else {
      _fetchStatus();
    }
  }

  Future<void> _fetchStatus() async {
    try {
      final response = await _transactionService.getTransactionStatus(
        widget.transactionCode!,
      );
      if (response.success && response.data != null && mounted) {
        setState(() {
          _data = response.data;
          _isLoading = false;
        });
      } else if (mounted) {
        AppToast.error(context, response.message);
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        AppToast.error(context, 'Failed to load transaction detail');
        Navigator.pop(context);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: AppColors.smoke200,
        appBar: const AppAppBar(title: 'Transaction Detail'),
        body: _buildSkeleton(),
      );
    }

    if (_data == null) {
      return Scaffold(
        backgroundColor: AppColors.smoke200,
        appBar: const AppAppBar(title: 'Transaction Detail'),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline_rounded,
                size: 64,
                color: Colors.red.withValues(alpha: 0.5),
              ),
              const SizedBox(height: 16),
              const Text(
                'Transaction not found',
                style: TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 24),
              AppButton(
                label: 'Go Back',
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
        ),
      );
    }

    final transaction = _data!;
    final isSuccess =
        transaction.status == 'success' || transaction.paymentStatus == 'paid';
    return Scaffold(
      backgroundColor: AppColors.smoke200,
      appBar: AppAppBar(
        title: 'Transaction Detail',
        onBackPressed: () {
          // If we came from history, we can just pop.
          // Navigation logic here depends on flow, normally pop is fine for detail
          if (Navigator.canPop(context)) {
            Navigator.pop(context);
          } else {
            Navigator.pushAndRemoveUntil(
              context,
              MaterialPageRoute(builder: (context) => const MainScreen()),
              (route) => false,
            );
          }
        },
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(left: 24, right: 24, bottom: 32),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: AppColors.smoke200,
                borderRadius: BorderRadius.circular(48),
                border: Border.all(
                  color: AppColors.brand500.withValues(alpha: 0.05),
                ),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.brand500.withValues(alpha: 0.04),
                    blurRadius: 16,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: (isSuccess ? AppColors.ocean500 : Colors.red)
                          .withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      isSuccess
                          ? Icons.check_circle_rounded
                          : Icons.cancel_rounded,
                      color: isSuccess ? AppColors.ocean500 : Colors.red,
                      size: 56,
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    isSuccess
                        ? 'Transaction Successful!'
                        : 'Transaction Failed',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: isSuccess ? AppColors.ocean500 : Colors.red,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    isSuccess
                        ? 'Your top-up has been processed and delivered.'
                        : (transaction.status == 'expired'
                              ? 'The payment time limit has expired.'
                              : 'The transaction could not be processed.'),
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.brand500.withValues(alpha: 0.5),
                    ),
                  ),
                  const SizedBox(height: 24),
                  _buildDetailItem(
                    context,
                    icon: Icons.receipt_long_rounded,
                    label: 'Invoice ID',
                    value: transaction.transactionCode,
                    onCopy: () {
                      Clipboard.setData(
                        ClipboardData(text: transaction.transactionCode),
                      );
                      AppToast.success(context, 'Invoice ID copied');
                    },
                  ),
                  const SizedBox(height: 8),
                  _buildDetailItem(
                    context,
                    icon: Icons.videogame_asset_rounded,
                    label: 'Game',
                    value: transaction.product['name'] ?? 'Game',
                  ),
                  const SizedBox(height: 8),
                  _buildDetailItem(
                    context,
                    icon: Icons.diamond_rounded,
                    label: isSuccess ? 'Item Delivered' : 'Item Ordered',
                    value: transaction.product['item'] ?? '',
                  ),
                  const SizedBox(height: 24),
                  if (isSuccess) ...[
                    AppButton(
                      width: double.infinity,
                      label: 'Download E-Receipt',
                      prefixIcon: Icons.file_download_outlined,
                      backgroundColor: Colors.transparent,
                      foregroundColor: AppColors.brand500.withValues(
                        alpha: 0.7,
                      ),
                      borderRadius: 999,
                      side: BorderSide(
                        color: AppColors.brand500.withValues(alpha: 0.1),
                      ),
                      onPressed: () {
                        // TODO: Implement receipt download
                      },
                    ),
                    const SizedBox(height: 16),
                  ],
                  AppButton(
                    width: double.infinity,
                    label: 'Back to Home',
                    prefixIcon: Icons.arrow_back_rounded,
                    borderRadius: 999,
                    onPressed: () {
                      Navigator.pushAndRemoveUntil(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const MainScreen(),
                        ),
                        (route) => false,
                      );
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSkeleton() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              color: AppColors.smoke200,
              borderRadius: BorderRadius.circular(48),
              border: Border.all(
                color: AppColors.brand500.withValues(alpha: 0.05),
              ),
              boxShadow: [
                BoxShadow(
                  color: AppColors.brand500.withValues(alpha: 0.04),
                  blurRadius: 16,
                  offset: const Offset(0, 1),
                ),
              ],
            ),
            child: AppShimmer(
              child: Column(
                children: [
                  const AppSkeletonCircle(size: 80),
                  const SizedBox(height: 24),
                  const AppSkeleton(height: 24, width: 220, borderRadius: 8),
                  const SizedBox(height: 12),
                  const AppSkeleton(height: 14, width: 280, borderRadius: 4),
                  const SizedBox(height: 32),
                  ...List.generate(
                    3,
                    (index) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: AppSkeleton(
                        height: 72,
                        width: double.infinity,
                        borderRadius: 24,
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  const AppSkeleton(
                    height: 56,
                    width: double.infinity,
                    borderRadius: 32,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailItem(
    BuildContext context, {
    required IconData icon,
    required String label,
    required String value,
    VoidCallback? onCopy,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cloud200,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.smoke200,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(icon, color: AppColors.ocean500, size: 24),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.brand500.withValues(alpha: 0.4),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: AppColors.brand500,
                  ),
                ),
              ],
            ),
          ),
          if (onCopy != null)
            IconButton(
              icon: Icon(
                Icons.content_copy_rounded,
                size: 18,
                color: AppColors.brand500.withValues(alpha: 0.3),
              ),
              onPressed: onCopy,
            ),
        ],
      ),
    );
  }
}
