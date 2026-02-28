class PostpaidInquiryResult {
  final String inquiryRef;
  final String productName;
  final String customerNo;
  final String customerName;
  final String period;
  final int tagihan;
  final int admin;
  final int total;

  PostpaidInquiryResult({
    required this.inquiryRef,
    required this.productName,
    required this.customerNo,
    required this.customerName,
    required this.period,
    required this.tagihan,
    required this.admin,
    required this.total,
  });

  factory PostpaidInquiryResult.fromJson(Map<String, dynamic> json) {
    return PostpaidInquiryResult(
      inquiryRef: json['inquiry_ref'] ?? '',
      productName: json['product_name'] ?? '',
      customerNo: json['customer_no'] ?? '',
      customerName: json['customer_name'] ?? '',
      period: json['period'] ?? '',
      tagihan: (json['tagihan'] as num?)?.toInt() ?? 0,
      admin: (json['admin'] as num?)?.toInt() ?? 0,
      total: (json['total'] as num?)?.toInt() ?? 0,
    );
  }
}

class PostpaidPayResult {
  final String transactionCode;
  final Map<String, dynamic> payment;

  PostpaidPayResult({required this.transactionCode, required this.payment});

  factory PostpaidPayResult.fromJson(Map<String, dynamic> json) {
    return PostpaidPayResult(
      transactionCode: json['transaction_code'] ?? '',
      payment: Map<String, dynamic>.from(json['payment'] ?? {}),
    );
  }
}
