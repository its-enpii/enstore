class ProductItem {
  final int id;
  final int productId;
  final String name;
  final String? group;
  final String? description;
  final int price;
  final int? totalSold;
  final bool isActive;
  final int sortOrder;

  ProductItem({
    required this.id,
    required this.productId,
    required this.name,
    this.group,
    this.description,
    required this.price,
    this.totalSold,
    required this.isActive,
    required this.sortOrder,
  });

  factory ProductItem.fromJson(Map<String, dynamic> json) {
    return ProductItem(
      id: json['id'],
      productId: json['product_id'],
      name: json['name'],
      group: json['group'],
      description: json['description'],
      price: json['price'] is int
          ? json['price']
          : (json['price'] as num?)?.toInt() ?? 0,
      totalSold: json['total_sold'],
      isActive: json['is_active'] ?? true,
      sortOrder: json['sort_order'] ?? 0,
    );
  }
}
