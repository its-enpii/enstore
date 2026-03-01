class PostpaidInquiryResult {
  final String inquiryRef;
  final String productName;
  final String customerNo;
  final String customerName;
  final String period;
  final int tagihan;
  final int admin;
  final int total;
  final List<PostpaidBillDetail> details;

  PostpaidInquiryResult({
    required this.inquiryRef,
    required this.productName,
    required this.customerNo,
    required this.customerName,
    required this.period,
    required this.tagihan,
    required this.admin,
    required this.total,
    this.details = const [],
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
      details: json['details'] != null
          ? (json['details'] as List)
              .map((e) => PostpaidBillDetail.fromJson(e))
              .toList()
          : [],
    );
  }
}

class PostpaidBillDetail {
  final String period;
  final int nominal;
  final int admin;
  final int denda;
  final String? meterAwal;
  final String? meterAkhir;
  final int biayaLain;

  PostpaidBillDetail({
    required this.period,
    required this.nominal,
    required this.admin,
    this.denda = 0,
    this.meterAwal,
    this.meterAkhir,
    this.biayaLain = 0,
  });

  factory PostpaidBillDetail.fromJson(Map<String, dynamic> json) {
    return PostpaidBillDetail(
      period: json['period'] ?? '',
      nominal: (json['nominal'] as num?)?.toInt() ?? 0,
      admin: (json['admin'] as num?)?.toInt() ?? 0,
      denda: (json['denda'] as num?)?.toInt() ?? 0,
      meterAwal: json['meter_awal']?.toString(),
      meterAkhir: json['meter_akhir']?.toString(),
      biayaLain: (json['biaya_lain'] as num?)?.toInt() ?? 0,
    );
  }
}

class PostpaidPayResult {
  final String transactionCode;
  final Map<String, dynamic> payment;

  PostpaidPayResult({required this.transactionCode, required this.payment});

  factory PostpaidPayResult.fromJson(Map<String, dynamic> json) {
    String trxCode = '';
    if (json.containsKey('transaction') && json['transaction'] is Map) {
      trxCode = json['transaction']['transaction_code'] ?? '';
    } else {
      trxCode = json['transaction_code'] ?? '';
    }

    return PostpaidPayResult(
      transactionCode: trxCode,
      payment: Map<String, dynamic>.from(json['payment'] ?? {}),
    );
  }
}
