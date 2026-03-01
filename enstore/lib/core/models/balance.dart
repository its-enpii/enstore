class BalanceData {
  final int balance;
  final int bonusBalance;
  final int availableBalance;

  BalanceData({
    required this.balance,
    required this.bonusBalance,
    required this.availableBalance,
  });

  factory BalanceData.fromJson(Map<String, dynamic> json) {
    return BalanceData(
      balance: _parseInt(json['balance']),
      bonusBalance: _parseInt(json['bonus_balance']),
      availableBalance: _parseInt(json['available_balance']),
    );
  }

  static int _parseInt(dynamic value) {
    if (value == null) return 0;
    if (value is int) return value;
    if (value is double) return value.toInt();
    return int.tryParse(value.toString()) ?? 0;
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
      id: json['id'] ?? 0,
      type: json['type'] ?? 'unknown',
      amount: BalanceData._parseInt(json['amount']),
      description: json['description'] ?? '',
      createdAt: DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
    );
  }
}
