import 'product_item.dart';

class Product {
  final int id;
  final String name;
  final String slug;
  final String? description;
  final int price;
  final String? image;
  final String? provider;
  final String? publisher;
  final String? brand;
  final List<ProductItem> items;
  final List<Map<String, dynamic>>? inputFields;

  Product({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    required this.price,
    this.image,
    this.provider,
    this.publisher,
    this.brand,
    this.items = const [],
    this.inputFields,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      name: json['name'],
      slug: json['slug'],
      description: json['description'],
      price: json['price'] is int
          ? json['price']
          : (json['price'] as num?)?.toInt() ?? 0,
      image: json['image'],
      provider: json['provider'],
      publisher: json['publisher'],
      brand: json['brand'],
      items: json['items'] != null
          ? (json['items'] as List).map((e) => ProductItem.fromJson(e)).toList()
          : [],
      inputFields: json['input_fields'] != null
          ? List<Map<String, dynamic>>.from(json['input_fields'])
          : null,
    );
  }
}

class ProductCategory {
  final int id;
  final String name;
  final String slug;
  final String? icon;

  ProductCategory({
    required this.id,
    required this.name,
    required this.slug,
    this.icon,
  });

  factory ProductCategory.fromJson(Map<String, dynamic> json) {
    return ProductCategory(
      id: json['id'],
      name: json['name'],
      slug: json['slug'],
      icon: json['icon'],
    );
  }
}
