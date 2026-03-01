import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/services/transaction_service.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../widgets/layout/app_app_bar.dart';
import '../../../widgets/feedback/app_toast.dart';
import '../../../widgets/feedback/app_skeleton.dart';
import '../../../widgets/layout/app_sticky_footer.dart';
import 'checkout/payment_screen.dart';
import '../../../../core/models/transaction.dart';

class TopupScreen extends StatefulWidget {
  const TopupScreen({super.key});

  @override
  State<TopupScreen> createState() => _TopupScreenState();
}

class _TopupScreenState extends State<TopupScreen> {
  final TextEditingController _amountController = TextEditingController();
  final List<int> _presetAmounts = [10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000];
  int? _selectedPreset;
  List<PaymentChannel> _paymentChannels = [];
  PaymentChannel? _selectedChannel;
  bool _isLoadingChannels = true;
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    _fetchPaymentChannels();
    _amountController.addListener(() {
      final amount = int.tryParse(_amountController.text.replaceAll('.', '')) ?? 0;
      if (!_presetAmounts.contains(amount)) {
        setState(() => _selectedPreset = null);
      }
    });
  }

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _fetchPaymentChannels() async {
    final transactionService = TransactionService(ApiClient());
    try {
      final response = await transactionService.getPaymentChannels();
      if (mounted) {
        setState(() {
          if (response.success) {
            // Filter out 'Internal' group as you can't topup with your own balance
            _paymentChannels = (response.data ?? [])
                .where((c) => c.group.toLowerCase() != 'internal')
                .toList();
            if (_paymentChannels.isNotEmpty) {
              _selectedChannel = _paymentChannels.first;
            }
          }
          _isLoadingChannels = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoadingChannels = false);
        AppToast.error(context, 'Gagal memuat metode pembayaran');
      }
    }
  }

  void _onAmountChanged(String value) {
    if (value.isEmpty) {
      setState(() {});
      return;
    }
    String cleanStr = value.replaceAll('.', '');
    int? amount = int.tryParse(cleanStr);
    if (amount != null) {
      _amountController.value = TextEditingValue(
        text: NumberFormat.decimalPattern('id_ID').format(amount),
        selection: TextSelection.collapsed(
          offset: NumberFormat.decimalPattern('id_ID').format(amount).length,
        ),
      );
      setState(() {});
    }
  }

  Future<void> _processTopup() async {
    final amountText = _amountController.text.replaceAll('.', '');
    final amount = int.tryParse(amountText) ?? 0;

    if (amount < 10000) {
      AppToast.warning(context, 'Minimal topup Rp. 10.000');
      return;
    }

    if (_selectedChannel == null) {
      AppToast.warning(context, 'Pilih metode pembayaran');
      return;
    }

    setState(() => _isProcessing = true);

    try {
      final transactionService = TransactionService(ApiClient());
      final response = await transactionService.createTopup({
        'amount': amount,
        'payment_method': _selectedChannel!.code,
      });

      if (mounted) {
        setState(() => _isProcessing = false);
        if (response.success && response.data != null) {
          final transactionCode = response.data!.transaction['transaction_code'];
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (_) => PaymentScreen(transactionCode: transactionCode),
            ),
          );
        } else {
          AppToast.error(context, response.message);
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isProcessing = false);
        AppToast.error(context, 'Terjadi kesalahan: $e');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.smoke200,
      appBar: const AppAppBar(title: 'Top Up Balance'),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.only(bottom: 120),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildAmountSection(),
                const SizedBox(height: 32),
                _buildPaymentMethodSection(),
              ],
            ),
          ),
          Align(
            alignment: Alignment.bottomCenter,
            child: _buildStickyFooter(),
          ),
        ],
      ),
    );
  }

  Widget _buildAmountSection() {
    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Nominal Top Up',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppColors.brand500.withValues(alpha: 0.9),
            ),
          ),
          const SizedBox(height: 16),
          // Premium Input Field
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            decoration: BoxDecoration(
              color: AppColors.cloud200,
              borderRadius: BorderRadius.circular(32),
              border: Border.all(color: AppColors.brand500.withValues(alpha: 0.05)),
              boxShadow: [
                BoxShadow(
                  color: AppColors.brand500.withValues(alpha: 0.02),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                Text(
                  'Rp. ',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: AppColors.brand500.withValues(alpha: 0.3),
                  ),
                ),
                Expanded(
                  child: TextField(
                    controller: _amountController,
                    keyboardType: TextInputType.number,
                    onChanged: _onAmountChanged,
                    style: const TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: AppColors.ocean500,
                      letterSpacing: -1,
                    ),
                    decoration: InputDecoration(
                      border: InputBorder.none,
                      hintText: '0',
                      hintStyle: TextStyle(
                        color: AppColors.brand500.withValues(alpha: 0.1),
                      ),
                      isDense: true,
                      contentPadding: EdgeInsets.zero,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),
          // Symmetrical 2-Column Grid
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 2.2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
            ),
            itemCount: _presetAmounts.length,
            itemBuilder: (context, index) {
              final amount = _presetAmounts[index];
              final isSelected = _selectedPreset == amount;
              return InkWell(
                onTap: () {
                  setState(() {
                    _selectedPreset = amount;
                    _amountController.text =
                        NumberFormat.decimalPattern('id_ID').format(amount);
                  });
                },
                borderRadius: BorderRadius.circular(24),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.ocean500.withValues(alpha: 0.1) : AppColors.smoke200,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: isSelected
                          ? AppColors.ocean500
                          : AppColors.brand500.withValues(alpha: 0.05),
                    ),
                  ),
                  child: Text(
                    NumberFormat.currency(
                      locale: 'id_ID',
                      symbol: 'Rp. ',
                      decimalDigits: 0,
                    ).format(amount),
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: isSelected
                          ? AppColors.ocean500
                          : AppColors.brand500.withValues(alpha: 0.9),
                    ),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentMethodSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Text(
            'Metode Pembayaran',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppColors.brand500.withValues(alpha: 0.9),
            ),
          ),
        ),
        const SizedBox(height: 16),
        if (_isLoadingChannels)
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 24),
            child: AppShimmer(
              child: Column(
                children: [
                  AppSkeleton(height: 80, width: double.infinity, borderRadius: 24),
                  SizedBox(height: 12),
                  AppSkeleton(height: 80, width: double.infinity, borderRadius: 24),
                ],
              ),
            ),
          )
        else
          _buildPaymentMethodList(),
      ],
    );
  }

  Widget _buildPaymentMethodList() {
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
          color: isSelected ? AppColors.ocean500.withValues(alpha: 0.05) : AppColors.smoke200,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: isSelected ? AppColors.ocean500 : AppColors.brand500.withValues(alpha: 0.05),
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
                channel.code.length >= 3 ? channel.code.substring(0, 3) : channel.code,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: isSelected ? AppColors.smoke200 : AppColors.ocean500,
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
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
                ],
              ),
            ),
            if (channel.feeFlat > 0 || channel.feePercent > 0)
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
                  Builder(
                    builder: (context) {
                      final amountText = _amountController.text.replaceAll('.', '');
                      final amount = int.tryParse(amountText) ?? 0;
                      double calculatedFee = channel.feeFlat + (amount * (channel.feePercent / 100));

                      return Text(
                        NumberFormat.currency(
                          locale: 'id_ID',
                          symbol: 'Rp. ',
                          decimalDigits: 0,
                        ).format(calculatedFee.ceil()),
                        style: const TextStyle(
                          fontSize: 14,
                          color: AppColors.ocean500,
                          fontWeight: FontWeight.w500,
                        ),
                      );
                    },
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStickyFooter() {
    final amountText = _amountController.text.replaceAll('.', '');
    final amount = int.tryParse(amountText) ?? 0;
    
    int total = amount;
    if (_selectedChannel != null) {
      double percentFee = amount * (_selectedChannel!.feePercent / 100);
      total += _selectedChannel!.feeFlat + percentFee.ceil();
    }

    return AppStickyFooter(
      label: 'TOTAL',
      value: NumberFormat.currency(
        locale: 'id_ID',
        symbol: 'Rp. ',
        decimalDigits: 0,
      ).format(total),
      buttonLabel: 'Lanjutkan',
      onButtonPressed: _isProcessing ? null : _processTopup,
    );
  }
}
