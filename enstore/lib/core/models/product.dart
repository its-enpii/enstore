class Product {
  final int id;
  final String name;
  final String slug;
  final String? description;
  final int price;
  final String? image;
  final String? provider;
  final String? brand;

  Product({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    required this.price,
    this.image,
    this.provider,
    this.brand,
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
      brand: json['brand'],
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
