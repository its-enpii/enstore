class ApiResponse<T> {
  final bool success;
  final String message;
  final T? data;
  final Map<String, List<String>>? errors;

  ApiResponse({
    required this.success,
    required this.message,
    this.data,
    this.errors,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic) fromJsonT,
  ) {
    return ApiResponse(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: json['data'] != null ? fromJsonT(json['data']) : null,
      errors: (json['errors'] as Map<String, dynamic>?)?.map(
        (key, value) =>
            MapEntry(key, (value as List).map((e) => e.toString()).toList()),
      ),
    );
  }
}

class PaginatedData<T> {
  final int currentPage;
  final List<T> data;
  final int lastPage;
  final int perPage;
  final int total;

  PaginatedData({
    required this.currentPage,
    required this.data,
    required this.lastPage,
    required this.perPage,
    required this.total,
  });

  factory PaginatedData.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic) fromJsonT,
  ) {
    return PaginatedData(
      currentPage: json['current_page'] ?? 1,
      data: (json['data'] as List?)?.map(fromJsonT).toList() ?? [],
      lastPage: json['last_page'] ?? 1,
      perPage: json['per_page'] ?? 15,
      total: json['total'] ?? 0,
    );
  }
}

class User {
  final int id;
  final String name;
  final String email;
  final String? phone;
  final String role;
  final String? balance; // Balance might be string or number

  User({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    required this.role,
    this.balance,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      phone: json['phone'],
      role: json['role'],
      balance: json['balance']?.toString(),
    );
  }
}

class Product {
  final int id;
  final String name;
  final String slug;
  final String? description;
  final int price;
  final String? image;

  Product({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    required this.price,
    this.image,
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

class PaymentChannel {
  final String code;
  final String name;
  final String group;
  final String iconUrl;
  final bool active;

  PaymentChannel({
    required this.code,
    required this.name,
    required this.group,
    required this.iconUrl,
    required this.active,
  });

  factory PaymentChannel.fromJson(Map<String, dynamic> json) {
    return PaymentChannel(
      code: json['code'],
      name: json['name'],
      group: json['group'],
      iconUrl: json['icon_url'],
      active: json['active'] ?? false,
    );
  }
}

class Transaction {
  final int id;
  final String transactionCode;
  final String status;
  final String paymentStatus;
  final int totalAmount;
  final String paymentMethod;
  final DateTime createdAt;

  Transaction({
    required this.id,
    required this.transactionCode,
    required this.status,
    required this.paymentStatus,
    required this.totalAmount,
    required this.paymentMethod,
    required this.createdAt,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: json['id'],
      transactionCode: json['transaction_code'] ?? json['reference'] ?? '',
      status: json['status'],
      paymentStatus: json['payment_status'],
      totalAmount: json['total_amount'] ?? 0,
      paymentMethod: json['payment_method'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}

class LoginResponse {
  final String token;
  final User user;

  LoginResponse({required this.token, required this.user});

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      token: json['token'],
      user: User.fromJson(json['user']),
    );
  }
}

class CustomerProfile {
  final int id;
  final String name;
  final String email;
  final String phone;
  final String role;
  final String customerType;
  final String status;
  final String? avatar;

  CustomerProfile({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.role,
    required this.customerType,
    required this.status,
    this.avatar,
  });

  factory CustomerProfile.fromJson(Map<String, dynamic> json) {
    return CustomerProfile(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      phone: json['phone'],
      role: json['role'],
      customerType: json['customer_type'],
      status: json['status'],
      avatar: json['avatar'],
    );
  }
}

class BalanceData {
  final int balance;
  final int holdAmount;
  final int availableBalance;

  BalanceData({
    required this.balance,
    required this.holdAmount,
    required this.availableBalance,
  });

  factory BalanceData.fromJson(Map<String, dynamic> json) {
    return BalanceData(
      balance: json['balance'] ?? 0,
      holdAmount: json['hold_amount'] ?? 0,
      availableBalance: json['available_balance'] ?? 0,
    );
  }
}

class BalanceMutation {
  final int id;
  final String type;
  final int amount;
  final String description;
  final DateTime createdAt;

  BalanceMutation({
    required this.id,
    required this.type,
    required this.amount,
    required this.description,
    required this.createdAt,
  });

  factory BalanceMutation.fromJson(Map<String, dynamic> json) {
    return BalanceMutation(
      id: json['id'],
      type: json['type'],
      amount: json['amount'],
      description: json['description'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}

class CustomerTransaction {
  final int id;
  final String transactionCode;
  final String status;
  final int totalPrice;

  CustomerTransaction({
    required this.id,
    required this.transactionCode,
    required this.status,
    required this.totalPrice,
  });

  factory CustomerTransaction.fromJson(Map<String, dynamic> json) {
    return CustomerTransaction(
      id: json['id'],
      transactionCode: json['transaction_code'],
      status: json['status'],
      totalPrice: json['total_price'],
    );
  }
}

class PurchaseResponse {
  final Map<String, dynamic> transaction;
  final Map<String, dynamic> payment;

  PurchaseResponse({required this.transaction, required this.payment});

  factory PurchaseResponse.fromJson(Map<String, dynamic> json) {
    return PurchaseResponse(
      transaction: json['transaction'],
      payment: json['payment'],
    );
  }
}

class TransactionStatus {
  final String transactionCode;
  final String status;
  final String paymentStatus;
  final int totalPrice;
  // Add other necessary fields as map or specific types
  final Map<String, dynamic> payment;
  final Map<String, dynamic> product;

  TransactionStatus({
    required this.transactionCode,
    required this.status,
    required this.paymentStatus,
    required this.totalPrice,
    required this.payment,
    required this.product,
  });

  factory TransactionStatus.fromJson(Map<String, dynamic> json) {
    return TransactionStatus(
      transactionCode: json['transaction_code'],
      status: json['status'],
      paymentStatus: json['payment_status'],
      totalPrice: json['total_price'],
      payment: json['payment'],
      product: json['product'],
    );
  }
}

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
      role: json['role'],
      status: json['status'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}
