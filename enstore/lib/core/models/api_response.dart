class ApiResponse<T> {
  final bool success;
  final String message;
  final T? data;
  final Map<String, List<String>>? errors;

  ApiResponse({
    required this.success,
    required this.message,
    this.data,
    this.errors,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic) fromJsonT,
  ) {
    return ApiResponse(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: json['data'] != null ? fromJsonT(json['data']) : null,
      errors: (json['errors'] as Map<String, dynamic>?)?.map(
        (key, value) =>
            MapEntry(key, (value as List).map((e) => e.toString()).toList()),
      ),
    );
  }
}

class PaginatedData<T> {
  final int currentPage;
  final List<T> data;
  final int lastPage;
  final int perPage;
  final int total;

  PaginatedData({
    required this.currentPage,
    required this.data,
    required this.lastPage,
    required this.perPage,
    required this.total,
  });

  factory PaginatedData.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic) fromJsonT,
  ) {
    // When using Laravel's native paginate(), the paginator is the root object.
    // The items are in 'data', and pagination metadata is at the root.
    final List<dynamic> dataList = json['data'] ?? [];

    return PaginatedData(
      currentPage: json['current_page'] ?? 1,
      data: dataList.map(fromJsonT).toList(),
      lastPage: json['last_page'] ?? 1,
      perPage: json['per_page'] ?? 15,
      total: json['total'] ?? 0,
    );
  }
}
