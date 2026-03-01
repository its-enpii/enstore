import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/services/voucher_service.dart';
import '../../../../core/models/voucher.dart';
import '../../../widgets/feedback/app_toast.dart';
import '../../../widgets/feedback/app_skeleton.dart';
import '../../../widgets/inputs/app_text_field.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';

class PromoScreen extends StatefulWidget {
  const PromoScreen({super.key});

  @override
  State<PromoScreen> createState() => _PromoScreenState();
}

class _PromoScreenState extends State<PromoScreen> {
  final ApiClient _apiClient = ApiClient();
  late final VoucherService _voucherService;
  List<VoucherModel> _vouchers = [];
  bool _isLoading = true;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _voucherService = VoucherService(_apiClient);
    _fetchVouchers();
    _searchController.addListener(() {
      setState(() => _searchQuery = _searchController.text.toLowerCase());
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchVouchers() async {
    setState(() => _isLoading = true);
    try {
      final response = await _voucherService.getVouchers();
      if (response.success) {
        setState(() {
          _vouchers = response.data ?? [];
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
        if (mounted) {
          AppToast.error(context, response.message);
        }
      }
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        AppToast.error(context, 'Failed to fetch promos');
      }
    }
  }

  List<VoucherModel> get _displayedVouchers {
    if (_searchQuery.isEmpty) return _vouchers;
    return _vouchers
        .where((v) =>
            v.name.toLowerCase().contains(_searchQuery) ||
            v.code.toLowerCase().contains(_searchQuery))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.smoke200,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _fetchVouchers,
          color: AppColors.ocean500,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(
              parent: BouncingScrollPhysics(),
            ),
            padding: const EdgeInsets.fromLTRB(24, 24, 24, 120),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Search Bar
                AppTextField(
                  controller: _searchController,
                  hintText: 'Search for promos',
                  prefixIcon: const Icon(Icons.search_rounded),
                ),
                const SizedBox(height: 24),
                
                // Section Title
                const Text(
                  'Available Promos',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: AppColors.brand500,
                  ),
                ),
                const SizedBox(height: 24),
                
                if (_isLoading)
                  _buildLoadingState()
                else if (_displayedVouchers.isEmpty)
                  _buildEmptyState()
                else
                  ..._displayedVouchers.map((voucher) => Column(
                    children: [
                      _buildPromoCard(context, voucher),
                      const SizedBox(height: 16),
                    ],
                  )).toList(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLoadingState() {
    return Column(
      children: List.generate(3, (index) => Padding(
        padding: const EdgeInsets.only(bottom: 16),
        child: AppSkeleton(
          height: 160,
          width: double.infinity,
          borderRadius: 24,
        ),
      )),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        children: [
          const SizedBox(height: 48),
          Icon(
            Icons.confirmation_number_outlined,
            size: 64,
            color: AppColors.brand500.withValues(alpha: 0.1),
          ),
          const SizedBox(height: 16),
          Text(
            'No promos available for now',
            style: TextStyle(
              fontSize: 16,
              color: AppColors.brand500.withValues(alpha: 0.4),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPromoCard(BuildContext context, VoucherModel voucher) {
    // Generate simple placeholder image based on voucher code if needed
    final String validUntil = voucher.endDate != null 
        ? 'Valid until ${DateFormat('dd MMM yyyy').format(voucher.endDate!)}'
        : 'Limited time offer';

    return Opacity(
      opacity: voucher.isAvailable ? 1.0 : 0.5,
      child: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          color: AppColors.cloud200,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: AppColors.brand500.withValues(alpha: 0.05),
          ),
        ),
        child: Column(
          children: [
            // Top Section: Icon + Info
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      color: AppColors.ocean500.withValues(alpha: 0.1),
                    ),
                    child: const Icon(
                      Icons.confirmation_number_rounded,
                      color: AppColors.ocean500,
                      size: 28,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          voucher.name,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: AppColors.brand500,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Text(
                              validUntil,
                              style: TextStyle(
                                fontSize: 13,
                                color: AppColors.brand500.withValues(alpha: 0.4),
                              ),
                            ),
                            if (!voucher.isAvailable) ...[
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: Colors.red.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: const Text(
                                  'Fully Used',
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: Colors.red,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ]
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            
            // Divider
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Divider(
                height: 1,
                color: AppColors.brand500.withValues(alpha: 0.05),
              ),
            ),
            
            // Bottom Section: Code + Copy Button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        voucher.isAvailable 
                            ? 'PROMO CODE (${voucher.userRemaining} left)' 
                            : 'PROMO CODE',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                          color: AppColors.brand500.withValues(alpha: 0.3),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        voucher.code,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppColors.brand500,
                        ),
                      ),
                    ],
                  ),
                  if (voucher.isAvailable)
                    GestureDetector(
                      onTap: () {
                        Clipboard.setData(ClipboardData(text: voucher.code));
                        AppToast.success(context, 'Code copied to clipboard');
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 24,
                          vertical: 12,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.ocean500,
                          borderRadius: BorderRadius.circular(32),
                        ),
                        child: const Text(
                          'Copy Code',
                          style: TextStyle(
                            color: AppColors.smoke200,
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                          ),
                        ),
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
}
