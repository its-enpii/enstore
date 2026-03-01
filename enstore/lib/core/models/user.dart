class User {
  final int id;
  final String name;
  final String email;
  final String? phone;
  final String role;
  final String? customerType;
  final String? balance;
  final String? bonusBalance;
  final String? avatar;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    required this.role,
    this.customerType,
    this.balance,
    this.bonusBalance,
    this.avatar,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    String? parsedBalance;
    String? parsedBonus;

    final balanceData = json['balance'];
    if (balanceData is Map) {
      parsedBalance = _parseString(balanceData['balance']);
      parsedBonus = _parseString(balanceData['bonus_balance']);
    } else {
      parsedBalance = _parseString(balanceData);
    }

    return User(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      phone: json['phone']?.toString(),
      role: json['role']?.toString() ?? 'customer',
      customerType: json['customer_type']?.toString(),
      balance: parsedBalance,
      bonusBalance: parsedBonus,
      avatar: json['avatar']?.toString(),
    );
  }

  static String? _parseString(dynamic value) {
    if (value == null) return null;
    if (value is String) return value;
    return value.toString();
  }
}
