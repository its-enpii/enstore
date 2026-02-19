class BannerModel {
  final int id;
  final String title;
  final String image;
  final String? link;
  final String? type;
  final bool isActive;
  final int sortOrder;

  BannerModel({
    required this.id,
    required this.title,
    required this.image,
    this.link,
    this.type,
    required this.isActive,
    required this.sortOrder,
  });

  factory BannerModel.fromJson(Map<String, dynamic> json) {
    return BannerModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()) ?? 0,
      title: json['title'] ?? '',
      image: json['image'] ?? '',
      link: json['link'],
      type: json['type'],
      isActive: json['is_active'] == true || json['is_active'] == 1 || json['is_active'] == '1',
      sortOrder: json['sort_order'] is int ? json['sort_order'] : int.tryParse(json['sort_order'].toString()) ?? 0,
    );
  }
}
