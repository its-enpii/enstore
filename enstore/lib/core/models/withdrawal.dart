class Withdrawal {
  final int id;
  final String referenceId;
  final double amount;
  final String paymentMethod;
  final String accountNumber;
  final String accountName;
  final String status;
  final String createdAt;

  Withdrawal({
    required this.id,
    required this.referenceId,
    required this.amount,
    required this.paymentMethod,
    required this.accountNumber,
    required this.accountName,
    required this.status,
    required this.createdAt,
  });

  factory Withdrawal.fromJson(Map<String, dynamic> json) {
    return Withdrawal(
      id: json['id'] ?? 0,
      referenceId: json['reference_id'] ?? '',
      amount: double.tryParse(json['amount']?.toString() ?? '0') ?? 0,
      paymentMethod: json['payment_method'] ?? '',
      accountNumber: json['account_number'] ?? '',
      accountName: json['account_name'] ?? '',
      status: json['status'] ?? 'pending',
      createdAt: json['created_at'] ?? '',
    );
  }
}
