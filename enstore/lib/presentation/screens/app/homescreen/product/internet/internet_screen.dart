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
import 'internet_bill_detail_screen.dart';

class InternetScreen extends StatefulWidget {
  const InternetScreen({super.key});

  @override
  State<InternetScreen> createState() => _InternetScreenState();
}

class _InternetScreenState extends State<InternetScreen> {
  final TextEditingController _idController = TextEditingController();
  String? _selectedIspId;
  List<ProductItem> _ispItems = [];
  bool _isLoading = true;
  bool _isChecking = false;

  @override
  void initState() {
    super.initState();
    _fetchIspProducts();
  }

  Future<void> _fetchIspProducts() async {
    final apiClient = ApiClient();
    final productService = ProductService(apiClient);

    try {
      // Mengambil detail produk berdasarkan slug 'internet-pascabayar'
      // agar kita bisa mendapatkan list items-nya
      final response = await productService.getProductBySlug(
        'internet-pascabayar',
      );

      if (mounted) {
        setState(() {
          if (response.success && response.data != null) {
            _ispItems = response.data!.items;
          }
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        AppToast.error(context, 'Gagal memuat daftar ISP: $e');
      }
    }
  }

  Future<void> _handleCheckBill() async {
    if (_selectedIspId == null) {
      AppToast.warning(context, 'Pilih provider internet terlebih dahulu');
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
        productItemId: int.parse(_selectedIspId!),
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
        print(e);
        AppToast.error(context, 'Gagal cek tagihan: $e');
      }
    }
  }

  void _showBillDetails(PostpaidInquiryResult result) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => InternetBillDetailScreen(inquiryResult: result),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.smoke200,
      appBar: const AppAppBar(title: 'Internet'),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.ocean500),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              physics: const BouncingScrollPhysics(),
              child: Column(
                children: [
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
                          hintText: 'Pilih Provider',
                          value: _selectedIspId,
                          prefixIcon: const Icon(Icons.wifi_rounded),
                          items: _ispItems.map((item) {
                            return DropdownMenuItem<String>(
                              value: item.id.toString(),
                              child: Text(item.name),
                            );
                          }).toList(),
                          onChanged: (val) =>
                              setState(() => _selectedIspId = val),
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
