import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/models/withdrawal.dart';
import '../../../../core/services/withdrawal_service.dart';
import '../../../widgets/feedback/app_skeleton.dart';
import '../../../widgets/feedback/app_toast.dart';
import '../../../widgets/feedback/app_dialog.dart';
import '../../../widgets/inputs/app_text_field.dart';
import '../../../widgets/buttons/app_button.dart';

class WithdrawalScreen extends StatefulWidget {
  const WithdrawalScreen({super.key});

  @override
  State<WithdrawalScreen> createState() => _WithdrawalScreenState();
}

class _WithdrawalScreenState extends State<WithdrawalScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;
  final ApiClient _apiClient = ApiClient();
  late final WithdrawalService _withdrawalService;

  // History state
  List<Withdrawal> _withdrawals = [];
  bool _isLoadingHistory = true;

  // Form state
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _accountNumberController = TextEditingController();
  final _accountNameController = TextEditingController();
  String _selectedPaymentMethod = 'BCA';
  bool _isSubmitting = false;

  static const List<String> _paymentMethods = [
    'BCA',
    'BNI',
    'BRI',
    'Mandiri',
    'CIMB',
    'GoPay',
    'OVO',
    'Dana',
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _withdrawalService = WithdrawalService(_apiClient);
    _fetchHistory();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _amountController.dispose();
    _accountNumberController.dispose();
    _accountNameController.dispose();
    super.dispose();
  }

  Future<void> _fetchHistory() async {
    setState(() => _isLoadingHistory = true);
    try {
      final response = await _withdrawalService.getWithdrawals();
      if (mounted) {
        setState(() {
          if (response.success) {
            _withdrawals = response.data ?? [];
          }
          _isLoadingHistory = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoadingHistory = false);
        AppToast.error(context, 'Gagal memuat riwayat penarikan');
      }
    }
  }

  Future<void> _submitWithdrawal() async {
    if (!_formKey.currentState!.validate()) return;

    final amount = double.tryParse(
      _amountController.text.replaceAll('.', '').replaceAll(',', ''),
    );
    if (amount == null || amount < 10000) {
      AppToast.error(context, 'Minimum penarikan adalah Rp 10.000');
      return;
    }

    AppDialog.show(
      context,
      title: 'Konfirmasi Penarikan',
      message:
          'Anda akan menarik Rp ${NumberFormat('#,###', 'id_ID').format(amount)} ke ${_selectedPaymentMethod} - ${_accountNumberController.text} (${_accountNameController.text}). Lanjutkan?',
      type: AppDialogType.info,
      confirmLabel: 'Tarik Saldo',
      cancelLabel: 'Batal',
      onConfirm: () async {
        setState(() => _isSubmitting = true);
        try {
          final response = await _withdrawalService.createWithdrawal(
            amount: amount,
            paymentMethod: _selectedPaymentMethod,
            accountNumber: _accountNumberController.text.trim(),
            accountName: _accountNameController.text.trim(),
          );

          if (mounted) {
            setState(() => _isSubmitting = false);
            if (response.success) {
              AppToast.success(
                context,
                'Permintaan penarikan berhasil diajukan!',
              );
              _amountController.clear();
              _accountNumberController.clear();
              _accountNameController.clear();
              // Refresh history & switch to history tab
              _fetchHistory();
              _tabController.animateTo(1);
            } else {
              AppToast.error(
                context,
                response.message.isNotEmpty
                    ? response.message
                    : 'Gagal mengajukan penarikan',
              );
            }
          }
        } catch (e) {
          if (mounted) {
            setState(() => _isSubmitting = false);
            AppToast.error(context, 'Terjadi kesalahan: $e');
          }
        }
      },
    );
  }

  String _statusLabel(String status) {
    switch (status) {
      case 'pending':
        return 'Menunggu';
      case 'approved':
        return 'Disetujui';
      case 'rejected':
        return 'Ditolak';
      case 'completed':
        return 'Selesai';
      default:
        return status;
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'approved':
      case 'completed':
        return const Color(0xFF10B981); // emerald
      case 'rejected':
        return AppColors.error;
      default:
        return const Color(0xFFF59E0B); // amber
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.smoke200,
      appBar: AppBar(
        backgroundColor: AppColors.smoke200,
        elevation: 0,
        centerTitle: true,
        title: const Text(
          'Tarik Saldo',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: AppColors.brand500,
            fontSize: 18,
          ),
        ),
        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back_ios_new_rounded,
            color: AppColors.brand500,
            size: 20,
          ),
          onPressed: () => Navigator.pop(context),
        ),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.ocean500,
          unselectedLabelColor: AppColors.brand500.withValues(alpha: 0.4),
          labelStyle: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 14,
          ),
          indicatorColor: AppColors.ocean500,
          indicatorWeight: 3,
          tabs: const [
            Tab(text: 'Tarik Saldo'),
            Tab(text: 'Riwayat'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [_buildWithdrawalForm(), _buildHistory()],
      ),
    );
  }

  // ─── FORM TAB ────────────────────────────────────────────────

  Widget _buildWithdrawalForm() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Info Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.ocean500.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: AppColors.ocean500.withValues(alpha: 0.15),
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(
                    Icons.info_outline_rounded,
                    color: AppColors.ocean500,
                    size: 20,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Minimum penarikan Rp 10.000. Proses 1-3 hari kerja.',
                      style: TextStyle(
                        fontSize: 13,
                        color: AppColors.brand500.withValues(alpha: 0.7),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 28),

            // Amount Field
            _buildLabel('Jumlah Penarikan (Rp)'),
            const SizedBox(height: 8),
            AppTextField(
              controller: _amountController,
              hintText: 'Contoh: 50000',
              keyboardType: TextInputType.number,
              validator: (value) {
                if (value == null || value.isEmpty) return 'Wajib diisi';
                final amount = double.tryParse(
                  value.replaceAll('.', '').replaceAll(',', ''),
                );
                if (amount == null || amount < 10000) {
                  return 'Minimum Rp 10.000';
                }
                return null;
              },
            ),

            const SizedBox(height: 20),

            // Payment Method Dropdown
            _buildLabel('Metode Penarikan'),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(
                color: AppColors.cloud200,
                borderRadius: BorderRadius.circular(16),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _selectedPaymentMethod,
                  isExpanded: true,
                  style: TextStyle(
                    color: AppColors.brand500.withValues(alpha: 0.9),
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                  dropdownColor: AppColors.cloud200,
                  borderRadius: BorderRadius.circular(16),
                  items: _paymentMethods.map((method) {
                    return DropdownMenuItem(value: method, child: Text(method));
                  }).toList(),
                  onChanged: (value) {
                    if (value != null) {
                      setState(() => _selectedPaymentMethod = value);
                    }
                  },
                ),
              ),
            ),

            const SizedBox(height: 20),

            // Account Number
            _buildLabel('Nomor Rekening / E-Wallet'),
            const SizedBox(height: 8),
            AppTextField(
              controller: _accountNumberController,
              hintText: 'Masukkan nomor rekening',
              keyboardType: TextInputType.number,
              validator: (value) =>
                  (value == null || value.isEmpty) ? 'Wajib diisi' : null,
            ),

            const SizedBox(height: 20),

            // Account Name
            _buildLabel('Nama Pemilik Rekening'),
            const SizedBox(height: 8),
            AppTextField(
              controller: _accountNameController,
              hintText: 'Sesuai nama di rekening',
              validator: (value) =>
                  (value == null || value.isEmpty) ? 'Wajib diisi' : null,
            ),

            const SizedBox(height: 32),

            // Submit Button
            AppButton(
              label: 'Ajukan Penarikan',
              isLoading: _isSubmitting,
              onPressed: _isSubmitting ? null : _submitWithdrawal,
              backgroundColor: AppColors.ocean500,
              foregroundColor: AppColors.smoke200,
              width: double.infinity,
            ),

            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Text(
      text.toUpperCase(),
      style: TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.bold,
        letterSpacing: 0.5,
        color: AppColors.brand500.withValues(alpha: 0.4),
      ),
    );
  }

  // ─── HISTORY TAB ─────────────────────────────────────────────

  Widget _buildHistory() {
    return RefreshIndicator(
      onRefresh: _fetchHistory,
      color: AppColors.ocean500,
      child: _isLoadingHistory
          ? _buildHistorySkeleton()
          : _withdrawals.isEmpty
          ? _buildEmptyState()
          : ListView.separated(
              padding: const EdgeInsets.fromLTRB(24, 24, 24, 120),
              itemCount: _withdrawals.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (_, index) =>
                  _buildWithdrawalCard(_withdrawals[index]),
            ),
    );
  }

  Widget _buildHistorySkeleton() {
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(24, 24, 24, 120),
      itemCount: 5,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (_, __) => AppShimmer(
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cloud200,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const AppSkeletonText(width: 120, height: 14),
                  AppSkeleton(width: 72, height: 24, borderRadius: 20),
                ],
              ),
              const SizedBox(height: 12),
              const AppSkeletonText(width: 200, height: 12),
              const SizedBox(height: 6),
              const AppSkeletonText(width: 150, height: 12),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildWithdrawalCard(Withdrawal w) {
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    final dateStr = w.createdAt.isNotEmpty
        ? DateFormat(
            'dd MMM yyyy, HH:mm',
          ).format(DateTime.tryParse(w.createdAt) ?? DateTime.now())
        : '-';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cloud200,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                formatter.format(w.amount),
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.brand500.withValues(alpha: 0.9),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: _statusColor(w.status).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  _statusLabel(w.status),
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: _statusColor(w.status),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Icon(
                Icons.account_balance_rounded,
                size: 14,
                color: AppColors.brand500.withValues(alpha: 0.4),
              ),
              const SizedBox(width: 6),
              Text(
                '${w.paymentMethod} • ${w.accountNumber}',
                style: TextStyle(
                  fontSize: 13,
                  color: AppColors.brand500.withValues(alpha: 0.6),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              Icon(
                Icons.person_outline_rounded,
                size: 14,
                color: AppColors.brand500.withValues(alpha: 0.4),
              ),
              const SizedBox(width: 6),
              Text(
                w.accountName,
                style: TextStyle(
                  fontSize: 13,
                  color: AppColors.brand500.withValues(alpha: 0.6),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            dateStr,
            style: TextStyle(
              fontSize: 11,
              color: AppColors.brand500.withValues(alpha: 0.3),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.account_balance_wallet_outlined,
            size: 72,
            color: AppColors.brand500.withValues(alpha: 0.1),
          ),
          const SizedBox(height: 16),
          Text(
            'Belum Ada Riwayat Penarikan',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppColors.brand500.withValues(alpha: 0.4),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Ajukan penarikan pertama Anda\nmelalui tab Tarik Saldo',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 13,
              color: AppColors.brand500.withValues(alpha: 0.3),
            ),
          ),
        ],
      ),
    );
  }
}
