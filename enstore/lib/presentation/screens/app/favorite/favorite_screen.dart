import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/models/product.dart';
import '../../../../core/services/favorite_service.dart';
import '../../../widgets/feedback/app_skeleton.dart';
import '../../../widgets/inputs/app_text_field.dart';
import '../home/product/game/game_detail_screen.dart';

class FavoriteScreen extends StatefulWidget {
  const FavoriteScreen({super.key});

  @override
  State<FavoriteScreen> createState() => _FavoriteScreenState();
}

class _FavoriteScreenState extends State<FavoriteScreen> {
  final FavoriteService _favoriteService = FavoriteService();
  List<Product> _favorites = [];
  List<Product> _filteredFavorites = [];
  bool _isLoading = true;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadFavorites();
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadFavorites() async {
    setState(() => _isLoading = true);
    final favorites = await _favoriteService.getFavorites();
    if (mounted) {
      setState(() {
        _favorites = favorites;
        _filteredFavorites = favorites;
        _isLoading = false;
      });
    }
  }

  void _onSearchChanged() {
    final query = _searchController.text.toLowerCase();
    setState(() {
      _filteredFavorites = _favorites.where((product) {
        return product.name.toLowerCase().contains(query) ||
            (product.publisher?.toLowerCase().contains(query) ?? false);
      }).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.smoke200,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 24, 24, 24),
              child: AppTextField(
                controller: _searchController,
                hintText: 'Search Games...',
                prefixIcon: const Icon(Icons.search_rounded),
              ),
            ),

            // Content
            Expanded(
              child: _isLoading
                  ? _buildLoadingGrid()
                  : _favorites.isEmpty
                      ? _buildEmptyState()
                      : _filteredFavorites.isEmpty
                          ? _buildNoResultsState()
                          : _buildFavoriteGrid(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLoadingGrid() {
    return GridView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.75,
        crossAxisSpacing: 16,
        mainAxisSpacing: 24,
      ),
      itemCount: 6,
      itemBuilder: (context, index) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: AppSkeleton(
                borderRadius: 24,
                width: double.infinity,
              ),
            ),
            const SizedBox(height: 12),
            AppSkeleton(height: 16, width: 100),
            const SizedBox(height: 4),
            AppSkeleton(height: 12, width: 60),
          ],
        );
      },
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.favorite_border_rounded,
            size: 80,
            color: AppColors.brand500.withValues(alpha: 0.1),
          ),
          const SizedBox(height: 24),
          const Text(
            'No favorites yet',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppColors.brand500,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Games you favorite will appear here',
            style: TextStyle(
              color: AppColors.brand500.withValues(alpha: 0.4),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNoResultsState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.search_off_rounded,
            size: 64,
            color: AppColors.brand500.withValues(alpha: 0.1),
          ),
          const SizedBox(height: 16),
          Text(
            'No matches found',
            style: TextStyle(
              fontSize: 16,
              color: AppColors.brand500.withValues(alpha: 0.4),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFavoriteGrid() {
    return GridView.builder(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 120),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.72,
        crossAxisSpacing: 16,
        mainAxisSpacing: 24,
      ),
      physics: const BouncingScrollPhysics(),
      itemCount: _filteredFavorites.length,
      itemBuilder: (context, index) {
        final product = _filteredFavorites[index];
        return _buildFavoriteCard(product);
      },
    );
  }

  Widget _buildFavoriteCard(Product product) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => GameDetailScreen(product: product),
          ),
        ).then((_) => _loadFavorites()); // Refresh on return
      },
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Cover Image
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 10,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(24),
                child: product.image != null && product.image!.isNotEmpty
                    ? Image.network(
                        product.image!,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => _buildImagePlaceholder(),
                      )
                    : _buildImagePlaceholder(),
              ),
            ),
          ),
          const SizedBox(height: 12),
          // Title
          Text(
            product.name,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: AppColors.brand500,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          // Publisher
          Text(
            product.publisher ?? 'Unknown Publisher',
            style: TextStyle(
              fontSize: 13,
              color: AppColors.brand500.withValues(alpha: 0.4),
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildImagePlaceholder() {
    return Container(
      color: AppColors.cloud200,
      width: double.infinity,
      height: double.infinity,
      child: Icon(
        Icons.gamepad_rounded,
        color: AppColors.brand500.withValues(alpha: 0.1),
        size: 40,
      ),
    );
  }
}
