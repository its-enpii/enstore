import 'client.dart';
import 'config.dart';
import 'types.dart';

class ProductService {
  static final ProductService _instance = ProductService._internal();

  factory ProductService() {
    return _instance;
  }

  ProductService._internal();

  Future<ApiResponse<PaginatedData<Product>>> getProducts({
    Map<String, dynamic>? filters,
  }) async {
    return await ApiClient().get<PaginatedData<Product>>(
      ApiConfig.endpoints.products.list,
      queryParameters: filters,
      fromJson: (data) =>
          PaginatedData.fromJson(data, (item) => Product.fromJson(item)),
    );
  }

  Future<ApiResponse<Product>> getProductById(String id) async {
    return await ApiClient().get<Product>(
      ApiConfig.endpoints.products.detail(id),
      fromJson: (data) => Product.fromJson(data),
    );
  }

  Future<ApiResponse<Product>> getProductBySlug(String slug) async {
    return await ApiClient().get<Product>(
      ApiConfig.endpoints.products.detailBySlug(slug),
      fromJson: (data) => Product.fromJson(data),
    );
  }

  Future<ApiResponse<List<ProductCategory>>> getCategories() async {
    return await ApiClient().get<List<ProductCategory>>(
      ApiConfig.endpoints.products.categories,
      fromJson: (data) =>
          (data as List).map((e) => ProductCategory.fromJson(e)).toList(),
      // Fix: Types in ApiClient.get might need adjustment for List<T>
    );
  }
}
