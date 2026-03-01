import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/services/auth_service.dart';
import '../../../../core/services/transaction_service.dart';
import '../../../../core/models/transaction.dart';
import '../../../widgets/feedback/app_toast.dart';
import '../../../widgets/feedback/app_skeleton.dart';
import '../../../widgets/inputs/app_text_field.dart';
import '../home/checkout/transaction_status_screen.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  final ApiClient _apiClient = ApiClient();
  late final TransactionService _transactionService;
  
  List<Transaction> _transactions = [];
  bool _isLoading = true;
  String _activeTab = 'All';
  final List<String> _tabs = ['All', 'Ongoing', 'Success'];
  
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _transactionService = TransactionService(_apiClient);
    _fetchHistory();
  }

  Future<void> _fetchHistory() async {
    final authService = AuthService(_apiClient);
    if (!await authService.isLoggedIn()) {
      setState(() => _isLoading = false);
      return;
    }

    setState(() => _isLoading = true);
    try {
      String? statusFilter;
      if (_activeTab == 'Ongoing') {
        // ... local filtering ...
      } else if (_activeTab == 'Success') {
        statusFilter = 'success';
      }

      final response = await _transactionService.getTransactionHistory(
        status: statusFilter,
      );

      if (response.success && response.data != null) {
        setState(() {
          _transactions = response.data!.data;
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
        // Silently fail if 401/unauthorized (guest)
        if (response.message.toLowerCase().contains('unauthorized')) return;
        if (mounted) AppToast.error(context, response.message);
      }
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) AppToast.error(context, 'Failed to load history');
    }
  }

  List<Transaction> get _filteredTransactions {
    List<Transaction> list = _transactions;
    
    // Filter by tab (if not done by API)
    if (_activeTab == 'Ongoing') {
      list = list.where((t) => ['pending', 'unpaid', 'processing'].contains(t.status.toLowerCase())).toList();
    }
    
    // Filter by search
    if (_searchQuery.isNotEmpty) {
      list = list.where((t) => 
        t.productName.toLowerCase().contains(_searchQuery.toLowerCase()) || 
        t.transactionCode.toLowerCase().contains(_searchQuery.toLowerCase())
      ).toList();
    }
    
    return list;
  }

  Map<String, List<Transaction>> get _groupedTransactions {
    final Map<String, List<Transaction>> grouped = {};
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));

    for (var tx in _filteredTransactions) {
      final txDate = DateTime(tx.createdAt.year, tx.createdAt.month, tx.createdAt.day);
      String key;
      if (txDate == today) {
        key = 'TODAY';
      } else if (txDate == yesterday) {
        key = 'YESTERDAY';
      } else {
        key = DateFormat('dd MMM yyyy').format(txDate).toUpperCase();
      }

      if (!grouped.containsKey(key)) {
        grouped[key] = [];
      }
      grouped[key]!.add(tx);
    }
    return grouped;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.smoke200,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            _buildTabs(),
            Expanded(
              child: RefreshIndicator(
                onRefresh: _fetchHistory,
                color: AppColors.ocean500,
                child: _isLoading ? _buildLoadingState() : _buildContent(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
      child: AppTextField(
        controller: _searchController,
        hintText: 'Search Transactions...',
        prefixIcon: const Icon(Icons.search_rounded),
        onChanged: (val) => setState(() => _searchQuery = val),
      ),
    );
  }

  Widget _buildTabs() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: AppColors.cloud200,
          borderRadius: BorderRadius.circular(32),
        ),
        child: Row(
          children: _tabs.map((tab) {
            final isSelected = _activeTab == tab;
            return Expanded(
              child: GestureDetector(
                onTap: () {
                  setState(() => _activeTab = tab);
                  _fetchHistory();
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.smoke50 : Colors.transparent,
                    borderRadius: BorderRadius.circular(28),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    tab,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      color: isSelected ? AppColors.ocean500 : AppColors.brand500.withValues(alpha: 0.4),
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildContent() {
    final grouped = _groupedTransactions;
    if (grouped.isEmpty) return _buildEmptyState();

    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 100),
      physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
      itemCount: grouped.length,
      itemBuilder: (context, index) {
        final dateKey = grouped.keys.elementAt(index);
        final txs = grouped[dateKey]!;
        
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.only(left: 8, bottom: 16),
              child: Text(
                dateKey,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1,
                  color: AppColors.brand500.withValues(alpha: 0.4),
                ),
              ),
            ),
            ...txs.map((tx) => _buildTransactionCard(tx)),
            const SizedBox(height: 16),
          ],
        );
      },
    );
  }

  Widget _buildTransactionCard(Transaction tx) {
    return GestureDetector(
      onTap: () => _onTransactionTap(tx),
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cloud200,
          borderRadius: BorderRadius.circular(24),
        ),
        child: Row(
          children: [
            // Icon
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                color: AppColors.smoke200,
                image: tx.productImage != null ? DecorationImage(
                  image: NetworkImage(tx.productImage!),
                  fit: BoxFit.cover,
                ) : null,
              ),
              child: tx.productImage == null ? const Icon(Icons.shopping_bag_outlined, color: AppColors.brand500) : null,
            ),
            const SizedBox(width: 16),
            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    tx.productName,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.brand500,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${DateFormat('HH:mm').format(tx.createdAt)} | ${tx.transactionCode}',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.brand500.withValues(alpha: 0.4),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            // Amount & Status
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  'Rp ${NumberFormat('#,###').format(tx.totalPrice).replaceAll(',', '.')}',
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: AppColors.brand500,
                  ),
                ),
                const SizedBox(height: 6),
                _buildStatusBadge(tx.status),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _onTransactionTap(Transaction tx) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => TransactionStatusScreen(transactionCode: tx.transactionCode),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    Color bgColor;
    String label = status.toUpperCase();

    switch (status.toLowerCase()) {
      case 'success':
        color = Colors.teal;
        bgColor = Colors.teal.withValues(alpha: 0.1);
        label = 'Success';
        break;
      case 'pending':
      case 'unpaid':
        color = Colors.orange;
        bgColor = Colors.orange.withValues(alpha: 0.1);
        label = 'Unpaid';
        break;
      case 'processing':
        color = AppColors.ocean500;
        bgColor = AppColors.ocean500.withValues(alpha: 0.1);
        label = 'Process';
        break;
      case 'failed':
      case 'expired':
        color = Colors.red;
        bgColor = Colors.red.withValues(alpha: 0.1);
        label = 'Failed';
        break;
      case 'refunded':
        color = Colors.blue;
        bgColor = Colors.blue.withValues(alpha: 0.1);
        label = 'Refund';
        break;
      default:
        color = AppColors.brand500.withValues(alpha: 0.4);
        bgColor = AppColors.brand500.withValues(alpha: 0.05);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.bold,
          color: color,
        ),
      ),
    );
  }

  Widget _buildLoadingState() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      itemCount: 5,
      itemBuilder: (context, index) => Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: AppSkeleton(
          height: 84,
          width: double.infinity,
          borderRadius: 24,
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.receipt_long_outlined,
            size: 64,
            color: AppColors.brand500.withValues(alpha: 0.1),
          ),
          const SizedBox(height: 16),
          Text(
            _searchQuery.isNotEmpty ? 'No transactions match' : 'No transactions yet',
            style: TextStyle(
              fontSize: 16,
              color: AppColors.brand500.withValues(alpha: 0.4),
            ),
          ),
        ],
      ),
    );
  }
}
