import 'package:enstore/core/helpers/string_helper.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../../../../core/theme/app_colors.dart';
import '../../../../../../core/models/postpaid.dart';
import '../../../../../widgets/layout/app_app_bar.dart';
import '../../../../../widgets/buttons/app_button.dart';
import '../../checkout/postpaid_checkout_screen.dart';
import '../../../../../widgets/cards/app_product_item_card.dart';

class PdamBillDetailScreen extends StatefulWidget {
  final PostpaidInquiryResult inquiryResult;

  const PdamBillDetailScreen({super.key, required this.inquiryResult});

  @override
  State<PdamBillDetailScreen> createState() => _PdamBillDetailScreenState();
}

class _PdamBillDetailScreenState extends State<PdamBillDetailScreen> {
  final bool _isProcessing = false;

  String _formatPrice(int price) {
    return NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp. ',
      decimalDigits: 0,
    ).format(price);
  }

  void _handleConfirmPayment() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => PostpaidCheckoutScreen(
          inquiryResult: widget.inquiryResult,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.smoke200,
      appBar: AppAppBar(title: widget.inquiryResult.productName),
      body: Stack(
        children: [
          SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildMainSummaryCard(),
                const SizedBox(height: 32),
                Text(
                  'Detailed Charges',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppColors.brand500.withValues(alpha: 0.9),
                  ),
                ),
                const SizedBox(height: 16),
                _buildDetailedChargesList(),
                const SizedBox(height: 120),
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

  Widget _buildMainSummaryCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: AppColors.smoke200,
        borderRadius: BorderRadius.circular(48),
        border: Border.all(color: AppColors.brand500.withValues(alpha: 0.05)),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.ocean500.withValues(alpha: 0.05),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.water_drop_rounded,
              color: AppColors.ocean500,
              size: 40,
            ),
          ),
          const SizedBox(height: 32),
          Text(
            'Total Amount',
            style: TextStyle(
              fontSize: 14,
              color: AppColors.brand500.withValues(alpha: 0.4),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _formatPrice(widget.inquiryResult.total),
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: AppColors.brand500.withValues(alpha: 0.9),
            ),
          ),
          const SizedBox(height: 24),
          Divider(color: AppColors.brand500.withValues(alpha: 0.05)),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildInquiryInfo('Customer', widget.inquiryResult.customerName, CrossAxisAlignment.start),
              _buildInquiryInfo('Period', widget.inquiryResult.period, CrossAxisAlignment.end),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInquiryInfo(String label, String value, CrossAxisAlignment crossAxisAlignment) {
    return Column(
      crossAxisAlignment: crossAxisAlignment,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: AppColors.brand500.withValues(alpha: 0.3),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value.capitalize(),
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: AppColors.brand500.withValues(alpha: 0.9),
          ),
        ),
      ],
    );
  }

  Widget _buildDetailedChargesList() {
    final details = widget.inquiryResult.details;

    if (details.isNotEmpty) {
      return Column(
        children: details
            .map((d) => _buildChargeItem(d))
            .toList(),
      );
    }

    // Fallback jika tidak ada detail, buat objek detail dari data ringkasan
    return _buildChargeItem(
      PostpaidBillDetail(
        period: widget.inquiryResult.period,
        nominal: widget.inquiryResult.tagihan,
        admin: widget.inquiryResult.admin,
      ),
    );
  }

  Widget _buildChargeItem(PostpaidBillDetail detail) {
    final amount = detail.nominal;
    final admin = detail.admin;
    final denda = detail.denda;
    final biayaLain = detail.biayaLain;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: AppProductItemCard(
        isSelected: false,
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        detail.period.capitalize(),
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppColors.brand500.withValues(alpha: 0.9),
                        ),
                      ),
                      if (detail.meterAwal != null && detail.meterAkhir != null) ...[
                        const SizedBox(height: 4),
                        Text(
                          'Meter: ${detail.meterAwal} - ${detail.meterAkhir}',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.brand500.withValues(alpha: 0.4),
                          ),
                        ),
                      ],
                      if (admin > 0 || denda > 0 || biayaLain > 0) ...[
                        const SizedBox(height: 4),
                        Text(
                          [
                            if (admin > 0) 'Admin ${_formatPrice(admin)}',
                            if (denda > 0) 'Denda ${_formatPrice(denda)}',
                            if (biayaLain > 0) 'Lainnya ${_formatPrice(biayaLain)}'
                          ].join(' • '),
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
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppColors.ocean500.withValues(alpha: 0.1),
                    border: Border.all(color: AppColors.ocean500.withValues(alpha: 0.2)),
                    borderRadius: BorderRadius.circular(99),
                  ),
                  child: Text(
                    _formatPrice(amount),
                    style: const TextStyle(
                      color: AppColors.ocean500,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFooter() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: AppButton(
        label: 'Confirm & Pay',
        suffixIcon: Icons.arrow_forward_rounded,
        isLoading: _isProcessing,
        onPressed: _handleConfirmPayment,
        width: double.infinity,
      ),
    );
  }
}
