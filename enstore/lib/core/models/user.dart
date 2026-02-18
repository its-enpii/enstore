class User {
  final int id;
  final String name;
  final String email;
  final String? phone;
  final String role;
  final String? customerType;
  final String? balance;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    required this.role,
    this.customerType,
    this.balance,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      phone: json['phone'],
      role: json['role'],
      customerType: json['customer_type'],
      balance: json['balance']?.toString(),
    );
  }
}
