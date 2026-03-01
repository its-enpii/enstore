import 'package:flutter/material.dart';
import '../../../../../../core/theme/app_colors.dart';
import '../../../../../../core/network/api_client.dart';
import '../../../../../../core/services/product_service.dart';
import '../../../../../../core/services/customer_service.dart';
import '../../../../../../core/services/auth_service.dart';
import '../../../../../../core/models/product_item.dart';
import '../../../../../../core/models/postpaid.dart';
import '../../../../../widgets/layout/app_app_bar.dart';
import '../../../../../widgets/inputs/app_text_field.dart';
import '../../../../../widgets/inputs/app_dropdown.dart';
import '../../../../../widgets/buttons/app_button.dart';
import '../../../../../widgets/feedback/app_toast.dart';
import '../../../../../widgets/feedback/app_skeleton.dart';
import 'pdam_bill_detail_screen.dart';

class PdamScreen extends StatefulWidget {
  const PdamScreen({super.key});

  @override
  State<PdamScreen> createState() => _PdamScreenState();
}

class _PdamScreenState extends State<PdamScreen> {
  final TextEditingController _idController = TextEditingController();
  String? _selectedPdamId;
  List<ProductItem> _pdamItems = [];
  bool _isLoading = true;
  bool _isChecking = false;

  @override
  void initState() {
    super.initState();
    _fetchPdamProducts();
  }

  Future<void> _fetchPdamProducts() async {
    final apiClient = ApiClient();
    final productService = ProductService(apiClient);

    try {
      final response = await productService.getProductBySlug(
        'pdam-pascabayar',
      );

      if (mounted) {
        setState(() {
          if (response.success && response.data != null) {
            _pdamItems = response.data!.items;
          }
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        AppToast.error(context, 'Failed to load PDAM list: $e');
      }
    }
  }

  Future<void> _handleCheckBill() async {
    if (_selectedPdamId == null) {
      AppToast.warning(context, 'Pilih wilayah PDAM terlebih dahulu');
      return;
    }
    if (_idController.text.isEmpty) {
      AppToast.warning(context, 'Masukkan ID Pelanggan');
      return;
    }

    final apiClient = ApiClient();
    final authService = AuthService(apiClient);

    if (!await authService.isLoggedIn()) {
      if (mounted) {
        AppToast.warning(
          context,
          'Silakan login terlebih dahulu untuk cek tagihan',
        );
      }
      return;
    }

    setState(() => _isChecking = true);

    try {
      final customerService = CustomerService(apiClient);
      final response = await customerService.postpaidInquiry(
        productItemId: int.parse(_selectedPdamId!),
        customerNo: _idController.text,
      );

      if (mounted) {
        setState(() => _isChecking = false);
        if (response.success && response.data != null) {
          _showBillDetails(response.data!);
        } else {
          AppToast.error(context, response.message);
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isChecking = false);
        AppToast.error(context, 'Gagal cek tagihan: $e');
      }
    }
  }

  void _showBillDetails(PostpaidInquiryResult result) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => PdamBillDetailScreen(inquiryResult: result),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.smoke200,
      appBar: const AppAppBar(title: 'Water'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        physics: const BouncingScrollPhysics(),
        child: Column(
          children: [
            if (_isLoading)
              AppShimmer(
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: AppColors.smoke200,
                    borderRadius: BorderRadius.circular(40),
                    border: Border.all(
                      color: AppColors.brand500.withValues(alpha: 0.05),
                    ),
                  ),
                  child: Column(
                    children: [
                      const AppSkeleton(height: 56, borderRadius: 24),
                      const SizedBox(height: 20),
                      const AppSkeleton(height: 56, borderRadius: 24),
                      const SizedBox(height: 24),
                      const AppSkeleton(height: 56, borderRadius: 56),
                    ],
                  ),
                ),
              )
            else
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.smoke200,
                  borderRadius: BorderRadius.circular(40),
                  border: Border.all(
                    color: AppColors.brand500.withValues(alpha: 0.05),
                  ),
                ),
                child: Column(
                  children: [
                    AppDropdown<String>(
                      hintText: 'Pilih Wilayah',
                      value: _selectedPdamId,
                      prefixIcon: const Icon(Icons.location_on_rounded),
                      items: _pdamItems.map((item) {
                        return DropdownMenuItem<String>(
                          value: item.id.toString(),
                          child: Text(item.name),
                        );
                      }).toList(),
                      onChanged: (val) =>
                          setState(() => _selectedPdamId = val),
                    ),
                    const SizedBox(height: 20),
                    AppTextField(
                      controller: _idController,
                      hintText: 'Nomor Pelanggan',
                      prefixIcon: const Icon(Icons.badge_outlined),
                      keyboardType: TextInputType.number,
                    ),
                    const SizedBox(height: 24),
                    AppButton(
                      label: 'Check Bill',
                      suffixIcon: Icons.arrow_forward_rounded,
                      onPressed: _handleCheckBill,
                      isLoading: _isChecking,
                      width: double.infinity,
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
