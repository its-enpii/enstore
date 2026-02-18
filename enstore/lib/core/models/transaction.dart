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
      paymentStatus: json['payment_status'] ?? 'pending',
      totalAmount: json['total_amount'] ?? json['total_price'] ?? 0,
      paymentMethod: json['payment_method'] ?? 'unknown',
      createdAt: DateTime.parse(json['created_at']),
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

class TransactionStatusModel {
  final String transactionCode;
  final String status;
  final String paymentStatus;
  final int totalPrice;
  final Map<String, dynamic> payment;
  final Map<String, dynamic> product;

  TransactionStatusModel({
    required this.transactionCode,
    required this.status,
    required this.paymentStatus,
    required this.totalPrice,
    required this.payment,
    required this.product,
  });

  factory TransactionStatusModel.fromJson(Map<String, dynamic> json) {
    return TransactionStatusModel(
      transactionCode: json['transaction_code'] ?? '',
      status: json['status'] ?? '',
      paymentStatus: json['payment_status'] ?? '',
      totalPrice: json['total_price'] ?? 0,
      payment: json['payment'] ?? {},
      product: json['product'] ?? {},
    );
  }
}
