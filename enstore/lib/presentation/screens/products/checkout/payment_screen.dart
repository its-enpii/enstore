import 'dart:async';
import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:dio/dio.dart';
import 'package:gal/gal.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../../../core/models/transaction.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/services/transaction_service.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../widgets/app_button.dart';
import '../../../widgets/app_toast.dart';
import 'transaction_status_screen.dart';

class PaymentScreen extends StatefulWidget {
  final String transactionCode;

  const PaymentScreen({super.key, required this.transactionCode});

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  late final TransactionService _transactionService;
  TransactionStatusModel? _transaction;
  bool _isLoading = true;
  String? _error;
  Timer? _pollingTimer;
  bool _isCopied = false;
  bool _isDownloading = false;

  @override
  void initState() {
    super.initState();
    _transactionService = TransactionService(ApiClient());
    _fetchStatus();
    _startPolling();
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    super.dispose();
  }

  void _startPolling() {
    _pollingTimer = Timer.periodic(const Duration(seconds: 5), (timer) {
      if (_transaction != null && !_isFinalState(_transaction)) {
        _fetchStatus(isPolling: true);
      } else if (_transaction != null) {
        timer.cancel();
      }
    });
  }

  bool _isFinalState(TransactionStatusModel? transaction) {
    if (transaction == null) return false;
    final status = transaction.status.toLowerCase();
    final paymentStatus = transaction.paymentStatus.toLowerCase();
    return status == 'success' || 
           status == 'failed' || 
           status == 'expired' || 
           paymentStatus == 'paid';
  }

  Future<void> _fetchStatus({bool isPolling = false}) async {
    if (!isPolling) setState(() => _isLoading = true);
    
    try {
      final response = await _transactionService.getTransactionStatus(widget.transactionCode);
      if (mounted) {
        if (response.success && response.data != null) {
          final TransactionStatusModel data = response.data!;
          if (mounted) {
            setState(() {
              _transaction = data;
              _isLoading = false;
              _error = null;
            });

            if (_isFinalState(data)) {
              WidgetsBinding.instance.addPostFrameCallback((_) {
                if (mounted) {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (context) => TransactionStatusScreen(transaction: data),
                    ),
                  );
                }
              });
            }
          }
        } else {
          setState(() {
            _error = response.message;
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Failed to load transaction: $e';
          _isLoading = false;
        });
      }
    }
  }

  String _formatPrice(dynamic price) {
    num value = 0;
    if (price is num) {
      value = price;
    } else if (price != null) {
      value = num.tryParse(price.toString()) ?? 0;
    }
    return NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp. ',
      decimalDigits: 0,
    ).format(value);
  }


  void _handleCopy(String text) {
    Clipboard.setData(ClipboardData(text: text));
    setState(() => _isCopied = true);
    AppToast.success(context, 'Copied to clipboard');
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _isCopied = false);
    });
  }

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    try {
      final success = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!success && mounted) {
        AppToast.error(context, 'Could not launch browser. Please open manually.');
      }
    } catch (e) {
      if (mounted) AppToast.error(context, 'Error launching URL: $e');
    }
  }

  Future<void> _downloadQR(String qrUrl) async {
    if (_isDownloading) return;

    setState(() => _isDownloading = true);

    try {
      // 1. Handle Permissions (Required for some Android versions)
      if (Platform.isAndroid) {
        await [Permission.storage].request();
      }

      // 2. Download Image bytes
      final response = await Dio().get(
        qrUrl,
        options: Options(responseType: ResponseType.bytes),
      );


      // 3. Save to Gallery
      await Gal.putImageBytes(
        Uint8List.fromList(response.data),
        name: "QR_${widget.transactionCode}",
      );

      if (mounted) {
        AppToast.success(context, 'QR Code saved to gallery!');
      }
    } catch (e) {
      if (mounted) {
        if (e is GalException) {
          AppToast.error(context, 'Permission or save error: ${e.type.name}');
        } else {
          AppToast.error(context, 'Error: $e');
        }
      }
    } finally {
      if (mounted) setState(() => _isDownloading = false);
    }
  }
  @override
  Widget build(BuildContext context) {
    if (_isLoading && _transaction == null) {
      return const Scaffold(
        backgroundColor: AppColors.smoke200,
        body: Center(child: CircularProgressIndicator(color: AppColors.ocean500)),
      );
    }

    if (_error != null && _transaction == null) {
      return Scaffold(
        backgroundColor: AppColors.smoke200,
        appBar: AppBar(backgroundColor: AppColors.smoke200, elevation: 0),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(_error!, style: const TextStyle(color: Colors.red)),
              const SizedBox(height: 16),
              AppButton(
                label: 'Go Back',
                width: 150,
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
        ),
      );
    }

    final transaction = _transaction!;
    final isExpired = transaction.status == 'expired';
    final isFailed = transaction.status == 'failed';
    final isPaid = transaction.paymentStatus == 'paid' || transaction.status == 'success';

    return Scaffold(
      backgroundColor: AppColors.smoke200,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(kToolbarHeight + 32),
        child: AppBar(
          backgroundColor: AppColors.smoke200,
          surfaceTintColor: Colors.transparent,
          elevation: 0,
          centerTitle: true,
          leading: Padding(
            padding: const EdgeInsets.only(left: 24),
            child: Container(
              decoration: const BoxDecoration(
                color: AppColors.cloud200,
                shape: BoxShape.circle,
              ),
              child: IconButton(
                icon: Icon(
                  Icons.arrow_back_ios_new_rounded,
                  size: 20,
                  color: AppColors.brand500.withValues(alpha: 0.9),
                ),
                onPressed: () => Navigator.pop(context),
              ),
            ),
          ),
          leadingWidth: 72,
          title: Text(
            'Payment',
            style: TextStyle(
              color: AppColors.brand500.withValues(alpha: 0.9),
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            _buildSummaryCard(transaction),
            const SizedBox(height: 32),
            if (!isPaid && !isExpired && !isFailed) _buildExpiryBanner(transaction),
            _buildPaymentDetailSection(transaction),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryCard(TransactionStatusModel transaction) {
    final product = transaction.product;
    final pricing = transaction.pricing;
    String imageUrl = product['image'] ?? '';
    if (imageUrl.isNotEmpty && !imageUrl.startsWith('http')) {
      imageUrl = '${ApiClient.baseUrl.replaceAll('/api', '')}/storage/$imageUrl';
    }

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
                        image: NetworkImage(imageUrl), fit: BoxFit.cover)
                    : null,
                color: AppColors.cloud200,
              ),
              child: imageUrl.isEmpty
                  ? Icon(Icons.image_not_supported_rounded,
                      color: AppColors.brand500.withValues(alpha: 0.9))
                  : null,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product['name'] ?? 'Product',
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.brand500.withValues(alpha: 0.6),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    product['item'] ?? '',
                    style: TextStyle(
                      fontSize: 20,
                      color: AppColors.brand500.withValues(alpha: 0.9),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _formatPrice(pricing['total'] ?? transaction.totalPrice),
                    style: const TextStyle(
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


  Widget _buildExpiryBanner(TransactionStatusModel transaction) {
    final expiredAt = transaction.payment['expired_at'];
    if (expiredAt == null) return const SizedBox.shrink();

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.ocean500.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: AppColors.ocean500.withValues(alpha: 0.2)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Row(
            children: [
              Icon(Icons.timer_rounded, size: 18, color: AppColors.ocean500),
              SizedBox(width: 8),
              Text(
                'Payment expires in',
                style: TextStyle(
                  fontSize: 13,
                  color: AppColors.ocean500,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          CountdownWidget(
            targetDate: DateTime.parse(expiredAt),
            onExpire: () => setState(() {}),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentDetailSection(TransactionStatusModel transaction) {
    final payment = transaction.payment;
    final String? qrUrl = payment['qr_url'];
    final String? paymentCode = payment['payment_code'];
    final String? checkoutUrl = payment['checkout_url'];

    return Container(
      margin: const EdgeInsets.all(24),
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: AppColors.smoke200,
        border: Border.all(color: AppColors.brand500.withValues(alpha: 0.05)),
        borderRadius: BorderRadius.circular(48),
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
          Text(
            qrUrl != null ? 'Scan QR to Pay' : 'Complete Payment',
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppColors.brand500,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            qrUrl != null
                ? 'Supports ShopeePay, OVO, DANA, GoPay, etc.'
                : 'Follow the instructions below to complete your payment.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: AppColors.brand500.withValues(alpha: 0.4),
            ),
          ),
          const SizedBox(height: 24),
          if (qrUrl != null)
            _buildQRView(qrUrl)
          else if (paymentCode != null)
            _buildPaymentCodeView(paymentCode, payment['instructions'])
          else if (checkoutUrl != null)
            _buildCheckoutUrlView(checkoutUrl, payment['instructions'])
          else
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 40),
              child: Text('Waiting for payment details...'),
            ),
          const SizedBox(height: 32),
          Divider(height: 1, color: AppColors.brand500.withValues(alpha: 0.05)),
          const SizedBox(height: 24),
          Text(
            'Paid already? It might take 1-2 mins to sync.',
            style: TextStyle(
              fontSize: 12,
              fontStyle: FontStyle.italic,
              color: AppColors.brand500.withValues(alpha: 0.4),
            ),
          ),
          const SizedBox(height: 16),
          AppButton(
            width: double.infinity,
            label: 'Check Status',
            prefixIcon: Icons.sync_rounded,
            borderRadius: 999,
            onPressed: () => _fetchStatus(),
          ),
        ],
      ),
    );
  }

  Widget _buildQRView(String qrUrl) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: AppColors.cloud200,
            borderRadius: BorderRadius.circular(24),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Image.network(
              qrUrl,
              width: 160,
              height: 160,
              fit: BoxFit.contain,
            ),
          ),
        ),

        const SizedBox(height: 24),
        AppButton(
          width: double.infinity,
          label: 'Download QR',
          backgroundColor: AppColors.smoke200,
          foregroundColor: AppColors.brand500,
          prefixIcon: Icons.file_download_rounded,
          isLoading: _isDownloading,
          borderRadius: 999,
          side: BorderSide(
            color: AppColors.brand500.withValues(alpha: 0.05),
          ),
          onPressed: () => _downloadQR(qrUrl),
        ),

      ],
    );
  }

  Widget _buildPaymentCodeView(String code, dynamic instructions) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cloud200,
            borderRadius: BorderRadius.circular(24),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Payment Code / VA Number',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.2,
                  color: AppColors.brand500.withValues(alpha: 0.4),
                ),
              ),
              const SizedBox(height: 4),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    code,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.brand500.withValues(alpha: 0.9),
                      letterSpacing: 1.5,
                    ),
                  ),
                  IconButton(
                    onPressed: () => _handleCopy(code),
                    icon: Icon(
                      _isCopied ? Icons.check_circle_rounded : Icons.content_copy_rounded,
                      color: _isCopied ? AppColors.ocean500 : AppColors.brand500.withValues(alpha: 0.9),
                      size: 16,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 32),
        Text(
          'How to pay:',
          style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.brand500.withValues(alpha: 0.9)),
        ),
        const SizedBox(height: 16),
        if (instructions is List)
          ...instructions.map((section) => _buildInstructionItem(section))
        else
          const Text('No instructions available.'),
      ],
    );
  }

  Widget _buildCheckoutUrlView(String url, dynamic instructions) {
     return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: AppColors.smoke200,
            borderRadius: BorderRadius.circular(32),
            border: Border.all(color: AppColors.brand500.withValues(alpha: 0.05)),
          ),
          child: Column(
            children: [
               Text(
                'Click the button below to complete your payment.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 14, color: AppColors.brand500.withValues(alpha: 0.9)),
              ),
              const SizedBox(height: 20),
              AppButton(
                label: 'Pay Now',
                onPressed: () => _launchUrl(url),
              ),
            ],
          ),
        ),
        const SizedBox(height: 32),
        Text(
          'How to pay:',
          style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.brand500.withValues(alpha: 0.9)),
        ),
        const SizedBox(height: 16),
        if (instructions is List)
          ...instructions.map((section) => _buildInstructionItem(section))
        else
          const Text('No instructions available.'),
      ],
    );
  }

  Widget _buildInstructionItem(dynamic section) {
    if (section is! Map) return const SizedBox.shrink();
    final steps = section['steps'] as List?;
    if (steps == null || steps.isEmpty) return const SizedBox.shrink();

    return Theme(
      data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
      child: ExpansionTile(
        title: Text(
          section['title'] ?? 'Instruction',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.brand500.withValues(alpha: 0.9)),
        ),
        tilePadding: EdgeInsets.zero,
        expandedAlignment: Alignment.topLeft,
        children: [
          Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: Column(
              children: steps.asMap().entries.map((entry) {
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 20,
                        height: 20,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: AppColors.ocean500.withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Text(
                          '${entry.key + 1}',
                          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.ocean500),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          entry.value.toString().replaceAll(RegExp(r'<[^>]*>'), ''),
                          style: TextStyle(fontSize: 13, color: AppColors.brand500.withValues(alpha: 0.7)),
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}

class CountdownWidget extends StatefulWidget {
  final DateTime targetDate;
  final VoidCallback onExpire;

  const CountdownWidget({super.key, required this.targetDate, required this.onExpire});

  @override
  State<CountdownWidget> createState() => _CountdownWidgetState();
}

class _CountdownWidgetState extends State<CountdownWidget> {
  late Timer _timer;
  String _timeLeft = '';

  @override
  void initState() {
    super.initState();
    _calculateTime();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) => _calculateTime());
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  void _calculateTime() {
    final now = DateTime.now();
    final difference = widget.targetDate.difference(now);

    if (difference.isNegative) {
      _timeLeft = '00:00:00';
      _timer.cancel();
      widget.onExpire();
    } else {
      final hours = difference.inHours.toString().padLeft(2, '0');
      final minutes = (difference.inMinutes % 60).toString().padLeft(2, '0');
      final seconds = (difference.inSeconds % 60).toString().padLeft(2, '0');
      _timeLeft = '$hours:$minutes:$seconds';
    }
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Text(
      _timeLeft,
      style: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.bold,
        color: AppColors.ocean500,
      ),
    );
  }
}
