class ApiConfig {
  // Base URL from environment variable or default
  static const String baseUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://10.0.2.2:8000/api', // Android Emulator localhost
  );

  static const _Endpoints endpoints = _Endpoints();
}

class _Endpoints {
  const _Endpoints();

  final _Products products = const _Products();
  final _Transactions transactions = const _Transactions();
  final _Auth auth = const _Auth();
  final _Customer customer = const _Customer();
  final _Admin admin = const _Admin();
}

class _Products {
  const _Products();

  String get list => '/products';
  String detail(String id) => '/products/$id';
  String detailBySlug(String slug) => '/products/slug/$slug';
  String get categories => '/products/categories';
}

class _Transactions {
  const _Transactions();

  String get purchase => '/transactions/purchase';
  String status(String code) => '/transactions/status/$code';
  String cancel(String code) => '/transactions/$code/cancel';
  String get paymentChannels => '/transactions/payment-channels';
  String get banners => '/banners';
}

class _Auth {
  const _Auth();

  String get login => '/auth/login';
  String get register => '/auth/register';
  String get logout => '/auth/logout';
  String get profile => '/auth/profile';
  String get forgotPassword => '/auth/forgot-password';
  String get resetPassword => '/auth/reset-password';
  String socialRedirect(String provider) => '/auth/social/$provider/redirect';
  String socialToken(String provider) => '/auth/social/$provider/token';
}

class _Customer {
  const _Customer();

  String get profile => '/customer/profile';
  String get updateProfile => '/customer/profile';
  String get changePassword => '/customer/profile/change-password';

  String get purchase => '/customer/transactions/purchase';
  String get purchaseBalance => '/customer/transactions/purchase-balance';
  String get transactions => '/customer/transactions';
  String transactionDetail(String code) => '/customer/transactions/$code';

  String get topup => '/customer/transactions/topup';
  String get paymentChannels => '/customer/transactions/payment-channels';

  String get balance => '/customer/balance';
  String get balanceMutations => '/customer/balance/mutations';

  String get withdrawals => '/customer/withdrawals';
  String get createWithdrawal => '/customer/withdrawals';

  String get postpaidInquiry => '/customer/postpaid/inquiry';
  String get postpaidPay => '/customer/postpaid/pay';

  final _Notifications notifications = const _Notifications();
  final _Analytics analytics = const _Analytics();
}

class _Notifications {
  const _Notifications();

  String get list => '/notifications';
  String get count => '/notifications/count';
  String markAsRead(String id) => '/notifications/read/$id';
  String get markAllAsRead => '/notifications/read-all';
}

class _Analytics {
  const _Analytics();

  String get dashboard => '/customer/analytics/dashboard';
  String get topProducts => '/customer/analytics/top-products';
}

class _Admin {
  const _Admin();

  String get dashboard => '/admin/dashboard';

  final _AdminProducts products = const _AdminProducts();
  final _AdminProductItems productItems = const _AdminProductItems();
  final _AdminCategories categories = const _AdminCategories();
  final _AdminTransactions transactions = const _AdminTransactions();
  final _AdminUsers users = const _AdminUsers();
  final _AdminSettings settings = const _AdminSettings();
  final _AdminReports reports = const _AdminReports();
  final _AdminActivityLogs activityLogs = const _AdminActivityLogs();
  final _AdminWithdrawals withdrawals = const _AdminWithdrawals();
  final _AdminBanners banners = const _AdminBanners();
  final _AdminVouchers vouchers = const _AdminVouchers();
}

class _AdminProducts {
  const _AdminProducts();

  String get list => '/admin/products';
  String get create => '/admin/products';
  String detail(String id) => '/admin/products/$id';
  String update(String id) => '/admin/products/$id';
  String delete(String id) => '/admin/products/$id';
  String get syncDigiflazz => '/admin/products/sync-digiflazz';
  String get bulkUpdatePrices => '/admin/products/bulk-update-prices';
}

class _AdminProductItems {
  const _AdminProductItems();

  String create(String productId) => '/admin/products/$productId/items';
  String detail(String id) => '/admin/products/items/$id';
  String update(String id) => '/admin/products/items/$id';
  String delete(String id) => '/admin/products/items/$id';
}

class _AdminCategories {
  const _AdminCategories();

  String get list => '/admin/products/categories';
  String get create => '/admin/products/categories';
  String detail(String id) => '/admin/products/categories/$id';
  String update(String id) => '/admin/products/categories/$id';
  String delete(String id) => '/admin/products/categories/$id';
}

class _AdminTransactions {
  const _AdminTransactions();

  String get list => '/admin/transactions';
  String get statistics => '/admin/transactions/statistics';
  String detail(String id) => '/admin/transactions/$id';
  String updateStatus(String id) => '/admin/transactions/$id/status';
}

class _AdminUsers {
  const _AdminUsers();

  String get list => '/admin/users';
  String get statistics => '/admin/users/statistics';
  String detail(String id) => '/admin/users/$id';
  String get create => '/admin/users';
  String update(String id) => '/admin/users/$id';
  String delete(String id) => '/admin/users/$id';
  String adjustBalance(String id) => '/admin/users/$id/adjust-balance';
}

class _AdminSettings {
  const _AdminSettings();

  String get list => '/admin/settings';
  String get profitMargins => '/admin/settings/profit-margins';
  String get updateProfitMargins => '/admin/settings/profit-margins';
  String detail(String key) => '/admin/settings/$key';
  String get create => '/admin/settings';
  String get bulkUpdate => '/admin/settings/bulk-update';
  String delete(String key) => '/admin/settings/$key';
}

class _AdminReports {
  const _AdminReports();

  String get sales => '/admin/reports/sales';
  String get products => '/admin/reports/products';
  String get users => '/admin/reports/users';
  String get balance => '/admin/reports/balance';
  String get paymentMethods => '/admin/reports/payment-methods';
  String get exportTransactions => '/admin/reports/export/transactions';
}

class _AdminActivityLogs {
  const _AdminActivityLogs();

  String get list => '/admin/activity-logs';
  String get statistics => '/admin/activity-logs/statistics';
  String detail(String id) => '/admin/activity-logs/$id';
  String get clean => '/admin/activity-logs/clean';
}

class _AdminWithdrawals {
  const _AdminWithdrawals();

  String get list => '/admin/withdrawals';
  String detail(String id) => '/admin/withdrawals/$id';
  String updateStatus(String id) => '/admin/withdrawals/$id/status';
}

class _AdminBanners {
  const _AdminBanners();

  String get list => '/admin/banners';
  String get create => '/admin/banners';
  String detail(String id) => '/admin/banners/$id';
  String update(String id) => '/admin/banners/$id';
  String delete(String id) => '/admin/banners/$id';
  String get updateOrder => '/admin/banners/update-order';
}

class _AdminVouchers {
  const _AdminVouchers();

  String get list => '/admin/vouchers';
  String get create => '/admin/vouchers';
  String detail(String id) => '/admin/vouchers/$id';
  String update(String id) => '/admin/vouchers/$id';
  String delete(String id) => '/admin/vouchers/$id';
}
