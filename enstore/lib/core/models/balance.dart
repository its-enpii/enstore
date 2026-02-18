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
