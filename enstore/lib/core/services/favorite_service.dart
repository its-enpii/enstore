import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/product.dart';

class FavoriteService {
  static const String _storageKey = 'favorite_products';

  Future<List<Product>> getFavorites() async {
    final prefs = await SharedPreferences.getInstance();
    final String? favoritesJson = prefs.getString(_storageKey);
    
    if (favoritesJson == null) return [];
    
    final List<dynamic> decoded = jsonDecode(favoritesJson);
    return decoded.map((item) => Product.fromJson(item)).toList();
  }

  Future<void> toggleFavorite(Product product) async {
    final favorites = await getFavorites();
    final index = favorites.indexWhere((item) => item.id == product.id);
    
    if (index >= 0) {
      favorites.removeAt(index);
    } else {
      favorites.insert(0, product);
    }
    
    await _saveFavorites(favorites);
  }

  Future<bool> isFavorite(int productId) async {
    final favorites = await getFavorites();
    return favorites.any((item) => item.id == productId);
  }

  Future<void> _saveFavorites(List<Product> favorites) async {
    final prefs = await SharedPreferences.getInstance();
    // We need a way to convert Product back to Map for JSON encoding
    // Let's add a toMap method to Product if it doesn't have one, 
    // or just use a simplified version here.
    final List<Map<String, dynamic>> favoritesMap = favorites.map((p) => {
      'id': p.id,
      'name': p.name,
      'slug': p.slug,
      'description': p.description,
      'price': p.price,
      'image': p.image,
      'icon': p.icon,
      'provider': p.provider,
      'publisher': p.publisher,
      'brand': p.brand,
    }).toList();
    
    await prefs.setString(_storageKey, jsonEncode(favoritesMap));
  }
}
