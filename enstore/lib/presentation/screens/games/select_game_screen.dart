import 'dart:async';
import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/network/api_client.dart';
import '../../../core/services/product_service.dart';
import '../../../core/models/product.dart';
import '../../widgets/app_text_field.dart';

class SelectGameScreen extends StatefulWidget {
  const SelectGameScreen({super.key});

  @override
  State<SelectGameScreen> createState() => _SelectGameScreenState();
}

class _SelectGameScreenState extends State<SelectGameScreen> {
  List<Product> _games = [];
  List<Product> _filteredGames = [];
  bool _isLoading = true;
  bool _isLoadingMore = false;
  int _currentPage = 1;
  bool _hasMoreData = true;

  Timer? _debounce;
  final TextEditingController _searchController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _fetchGames();
    _searchController.addListener(_onSearchChanged);
    _scrollController.addListener(_scrollListener);
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _onSearchChanged() {
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () {
      _fetchGames();
    });
  }

  void _scrollListener() {
    if (_scrollController.position.pixels >=
            _scrollController.position.maxScrollExtent - 200 &&
        !_isLoadingMore &&
        _hasMoreData) {
      _fetchMoreGames();
    }
  }

  Future<void> _fetchGames() async {
    final apiClient = ApiClient();
    final productService = ProductService(apiClient);

    setState(() {
      _isLoading = true;
      _currentPage = 1;
      _hasMoreData = true;
    });

    final query = _searchController.text.trim();
    final Map<String, dynamic> filters = {
      'category': 'games',
      'page': _currentPage,
    };
    if (query.isNotEmpty) {
      filters['search'] = query;
    }

    try {
      final response = await productService.getProducts(filters: filters);
      if (mounted) {
        setState(() {
          if (response.success) {
            if (response.data != null && response.data!.data.isNotEmpty) {
              _games = response.data!.data;
              _hasMoreData =
                  response.data!.currentPage < response.data!.lastPage;
            } else {
              _games = [];
              _hasMoreData = false;
            }
            _filteredGames = List.from(_games);
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Error: ${response.message}'),
                backgroundColor: AppColors.error,
              ),
            );
          }
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Connection Error: $e'),
              backgroundColor: AppColors.error,
            ),
          );
        });
      }
    }
  }

  Future<void> _fetchMoreGames() async {
    final apiClient = ApiClient();
    final productService = ProductService(apiClient);

    setState(() {
      _isLoadingMore = true;
      _currentPage++;
    });

    final query = _searchController.text.trim();
    final Map<String, dynamic> filters = {
      'category': 'games',
      'page': _currentPage,
    };
    if (query.isNotEmpty) {
      filters['search'] = query;
    }

    try {
      final response = await productService.getProducts(filters: filters);
      if (mounted) {
        setState(() {
          if (response.success) {
            if (response.data != null && response.data!.data.isNotEmpty) {
              _games.addAll(response.data!.data);
              _hasMoreData =
                  response.data!.currentPage < response.data!.lastPage;
            } else {
              _hasMoreData = false;
            }
            _filteredGames = List.from(_games);
          }
          _isLoadingMore = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoadingMore = false;
          _currentPage--; // Revert page increment on failure
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Connection Error: $e'),
              backgroundColor: AppColors.error,
            ),
          );
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.smoke200,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        leading: Padding(
          padding: const EdgeInsets.only(left: 24, top: 4, bottom: 4),
          child: Container(
            decoration: const BoxDecoration(
              color: AppColors.cloud200,
              shape: BoxShape.circle,
            ),
            child: IconButton(
              icon: const Icon(
                Icons.arrow_back_ios_new_rounded,
                size: 18,
                color: AppColors.brand500,
              ),
              onPressed: () => Navigator.pop(context),
            ),
          ),
        ),
        leadingWidth: 72, // 24 padding + 48 circle
        title: const Text(
          'Select Game',
          style: TextStyle(
            color: AppColors.brand500,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 24, top: 4, bottom: 4),
            child: Container(
              width: 48,
              height: 48,
              decoration: const BoxDecoration(
                color: AppColors.cloud200,
                shape: BoxShape.circle,
              ),
              child: IconButton(
                icon: const Icon(
                  Icons.tune_rounded,
                  size: 20,
                  color: AppColors.brand500,
                ),
                onPressed: () {},
              ),
            ),
          ),
        ],
      ),
      body: CustomScrollView(
        controller: _scrollController,
        physics: const BouncingScrollPhysics(),
        slivers: [
          // Search Bar
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(24, 32, 24, 24),
              child: AppTextField(
                controller: _searchController,
                hintText: 'Search Games...',
                prefixIcon: const Icon(Icons.search_rounded),
                textInputAction: TextInputAction.search,
              ),
            ),
          ),

          // Games Grid or Loading
          if (_isLoading)
            const SliverFillRemaining(
              child: Center(
                child: CircularProgressIndicator(color: AppColors.ocean500),
              ),
            )
          else if (_filteredGames.isEmpty)
            SliverFillRemaining(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.search_off_rounded,
                      size: 64,
                      color: AppColors.brand500.withValues(alpha: 0.2),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'No games found',
                      style: TextStyle(
                        color: AppColors.brand500.withValues(alpha: 0.5),
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.72,
                  crossAxisSpacing: 32,
                  mainAxisSpacing: 32,
                ),
                delegate: SliverChildBuilderDelegate((context, index) {
                  return _buildGameCard(_filteredGames[index]);
                }, childCount: _filteredGames.length),
              ),
            ),

          if (_isLoadingMore)
            const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: 24),
                child: Center(
                  child: CircularProgressIndicator(color: AppColors.ocean500),
                ),
              ),
            )
          else
            const SliverToBoxAdapter(child: SizedBox(height: 80)),
        ],
      ),
    );
  }

  Widget _buildGameCard(Product game) {
    String imageUrl = game.image ?? '';
    if (imageUrl.isNotEmpty && !imageUrl.startsWith('http')) {
      imageUrl =
          '${ApiClient.baseUrl.replaceAll('/api', '')}/storage/$imageUrl';
    }

    return GestureDetector(
      onTap: () {
        // Navigate to topup details later
      },
      child: Container(
        padding: EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppColors.cloud200,
          borderRadius: BorderRadius.circular(24),
        ),
        child: Column(
          children: [
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  color: AppColors.cloud200,
                  image: imageUrl.isNotEmpty
                      ? DecorationImage(
                          image: NetworkImage(imageUrl),
                          fit: BoxFit.cover,
                        )
                      : null,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.brand500.withValues(alpha: 0.1),
                      blurRadius: 16,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: imageUrl.isEmpty
                    ? Icon(
                        Icons.image_not_supported_rounded,
                        size: 48,
                        color: AppColors.brand500.withValues(alpha: 0.2),
                      )
                    : null,
              ),
            ),

            const SizedBox(height: 12),
            Text(
              game.name,
              style: TextStyle(
                color: AppColors.brand500.withValues(alpha: 0.9),
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 4),
            Text(
              game.provider ?? 'Game',
              style: TextStyle(
                color: AppColors.brand500.withValues(alpha: 0.5),
                fontSize: 14,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
