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
    final amount = json['total_amount'] ?? json['total_price'] ?? 0;
    return Transaction(
      id: json['id'],
      transactionCode: json['transaction_code'] ?? json['reference'] ?? '',
      status: json['status'],
      paymentStatus: json['payment_status'] ?? 'pending',
      totalAmount: amount is num ? amount.toInt() : (double.tryParse(amount.toString())?.toInt() ?? 0),
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
  final int feeFlat;
  final double feePercent;

  PaymentChannel({
    required this.code,
    required this.name,
    required this.group,
    required this.iconUrl,
    required this.active,
    this.feeFlat = 0,
    this.feePercent = 0,
  });

  factory PaymentChannel.fromJson(Map<String, dynamic> json) {
    final totalFee = json['total_fee'] ?? {};
    final flat = totalFee['flat'] ?? 0;
    final percent = totalFee['percent'] ?? 0;

    return PaymentChannel(
      code: json['code'] ?? '',
      name: json['name'] ?? '',
      group: json['group'] ?? '',
      iconUrl: json['icon_url'] ?? '',
      active: json['active'] ?? false,
      feeFlat: flat is num ? flat.toInt() : (double.tryParse(flat.toString())?.toInt() ?? 0),
      feePercent: percent is num ? percent.toDouble() : (double.tryParse(percent.toString()) ?? 0.0),
    );
  }
}

class PurchaseResponse {
  final Map<String, dynamic> transaction;
  final Map<String, dynamic> payment;

  PurchaseResponse({required this.transaction, required this.payment});

  factory PurchaseResponse.fromJson(Map<String, dynamic> json) {
    return PurchaseResponse(
      transaction: json['transaction'] ?? {},
      payment: json['payment'] ?? {},
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
  final Map<String, dynamic> pricing;
  final String? sn;
  final String? note;

  TransactionStatusModel({
    required this.transactionCode,
    required this.status,
    required this.paymentStatus,
    required this.totalPrice,
    required this.payment,
    required this.product,
    required this.pricing,
    this.sn,
    this.note,
  });

  factory TransactionStatusModel.fromJson(Map<String, dynamic> json) {
    final total = json['total_price'] ?? 0;
    return TransactionStatusModel(
      transactionCode: json['transaction_code'] ?? '',
      status: json['status'] ?? '',
      paymentStatus: json['payment_status'] ?? '',
      totalPrice: total is num ? total.toInt() : (double.tryParse(total.toString())?.toInt() ?? 0),
      payment: json['payment'] ?? {},
      product: json['product'] ?? {},
      pricing: json['pricing'] ?? {},
      sn: json['sn'],
      note: json['note'],
    );
  }
}


