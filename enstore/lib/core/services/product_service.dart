import '../network/api_client.dart';
import '../constants/api_endpoints.dart';
import '../models/api_response.dart';
import '../models/product.dart';

class ProductService {
  final ApiClient _apiClient;

  ProductService(this._apiClient);

  Future<ApiResponse<PaginatedData<Product>>> getProducts({
    Map<String, dynamic>? filters,
  }) async {
    final response = await _apiClient.get(
      ApiEndpoints.products,
      queryParameters: filters,
    );

    return ApiResponse.fromJson(
      response.data,
      (data) => PaginatedData.fromJson(data, (item) => Product.fromJson(item)),
    );
  }

  Future<ApiResponse<Product>> getProductById(int id) async {
    final response = await _apiClient.get(ApiEndpoints.productDetail(id));

    return ApiResponse.fromJson(
      response.data,
      (data) => Product.fromJson(data),
    );
  }

  Future<ApiResponse<Product>> getProductBySlug(String slug) async {
    final response = await _apiClient.get(
      ApiEndpoints.productDetailBySlug(slug),
    );

    return ApiResponse.fromJson(
      response.data,
      (data) => Product.fromJson(data),
    );
  }

  Future<ApiResponse<List<ProductCategory>>> getCategories() async {
    final response = await _apiClient.get(ApiEndpoints.categories);

    return ApiResponse.fromJson(
      response.data,
      (data) => (data as List).map((e) => ProductCategory.fromJson(e)).toList(),
    );
  }
}
