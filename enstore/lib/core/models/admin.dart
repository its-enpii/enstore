class AdminDashboardStats {
  final int totalUsers;
  final int totalProducts;
  final int totalTransactions;
  final int totalRevenue;

  AdminDashboardStats({
    required this.totalUsers,
    required this.totalProducts,
    required this.totalTransactions,
    required this.totalRevenue,
  });

  factory AdminDashboardStats.fromJson(Map<String, dynamic> json) {
    return AdminDashboardStats(
      totalUsers: json['total_users'] ?? 0,
      totalProducts: json['total_products'] ?? 0,
      totalTransactions: json['total_transactions'] ?? 0,
      totalRevenue: json['total_revenue'] ?? 0,
    );
  }
}

class AdminProduct {
  final int id;
  final String name;
  final String sku;
  final int price;
  final int stock;
  final bool isActive;

  AdminProduct({
    required this.id,
    required this.name,
    required this.sku,
    required this.price,
    required this.stock,
    required this.isActive,
  });

  factory AdminProduct.fromJson(Map<String, dynamic> json) {
    return AdminProduct(
      id: json['id'],
      name: json['name'],
      sku: json['sku'] ?? '',
      price: json['price'] ?? 0,
      stock: json['stock'] ?? 0,
      isActive: json['is_active'] ?? false,
    );
  }
}

class AdminUser {
  final int id;
  final String name;
  final String email;
  final String role;
  final String status;
  final DateTime createdAt;

  AdminUser({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.status,
    required this.createdAt,
  });

  factory AdminUser.fromJson(Map<String, dynamic> json) {
    return AdminUser(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      role: json['role'] ?? 'customer',
      status: json['status'] ?? 'active',
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}
