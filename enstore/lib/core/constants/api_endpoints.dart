class ApiEndpoints {
  static const String baseUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://10.0.2.2:8000/api',
  );

  // Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String logout = '/auth/logout';
  static const String profile = '/auth/profile';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';
  static String socialRedirect(String provider) =>
      '/auth/social/$provider/redirect';
  static String socialToken(String provider) => '/auth/social/$provider/token';

  // Products
  static const String products = '/products';
  static String productDetail(int id) => '/products/$id';
  static String productDetailBySlug(String slug) => '/products/slug/$slug';
  static const String categories = '/products/categories';

  // Customer
  static const String customerProfile = '/customer/profile';
  static const String customerUpdateProfile = '/customer/profile';
  static const String customerChangePassword =
      '/customer/profile/change-password';
  static const String customerTransactions = '/customer/transactions';
  static String customerTransactionDetail(String code) =>
      '/customer/transactions/$code';
  static const String customerBalance = '/customer/balance';
  static const String customerBalanceMutations = '/customer/balance/mutations';
  static const String customerWithdrawals = '/customer/withdrawals';
  static const String customerNotifications = '/notifications';
  static const String customerNotificationCount = '/notifications/count';
  static String customerNotificationRead(String id) =>
      '/notifications/read/$id';
  static const String customerNotificationReadAll = '/notifications/read-all';

  // Public
  static const String banners = '/banners';
  static const String appConfig = '/app-config';
  static const String publicPurchase = '/transactions/purchase';
  static String publicTransactionStatus(String code) =>
      '/transactions/status/$code';
  static const String publicPaymentChannels = '/transactions/payment-channels';
  static String publicTransactionCancel(String code) =>
      '/transactions/$code/cancel';

  // Admin
  static const String adminDashboard = '/admin/dashboard';
  static const String adminProducts = '/admin/products';
  static const String adminUsers = '/admin/users';
  static const String adminTransactions = '/admin/transactions';

  // Devices
  static const String deviceRegister = '/customer/devices/register';
  static String deviceDelete(String deviceId) => '/customer/devices/$deviceId';
}
