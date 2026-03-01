class VoucherModel {
  final int id;
  final String code;
  final String name;
  final String type;
  final double value;
  final String? description;
  final DateTime? startDate;
  final DateTime? endDate;
  final double minTransaction;
  final double? maxDiscount;
  final bool isAvailable;
  final int userRemaining;

  VoucherModel({
    required this.id,
    required this.code,
    required this.name,
    required this.type,
    required this.value,
    this.description,
    this.startDate,
    this.endDate,
    required this.minTransaction,
    this.maxDiscount,
    this.isAvailable = true,
    this.userRemaining = 0,
  });

  factory VoucherModel.fromJson(Map<String, dynamic> json) {
    return VoucherModel(
      id: json['id'],
      code: json['code'],
      name: json['name'],
      type: json['type'],
      value: double.tryParse(json['value'].toString()) ?? 0.0,
      description: json['description'],
      startDate: json['start_date'] != null ? DateTime.parse(json['start_date']) : null,
      endDate: json['end_date'] != null ? DateTime.parse(json['end_date']) : null,
      minTransaction: double.tryParse(json['min_transaction'].toString()) ?? 0.0,
      maxDiscount: json['max_discount'] != null ? double.tryParse(json['max_discount'].toString()) : null,
      isAvailable: json['is_available'] ?? true,
      userRemaining: json['user_remaining'] ?? 0,
    );
  }
}
