import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'core/constants/api_endpoints.dart';
import 'core/theme/app_colors.dart';
import 'presentation/screens/splash_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Set system UI overlay style for a cleaner look
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Colors.transparent,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  // Debug API URL
  debugPrint('--- APP STARTING ---');
  debugPrint('API URL: ${ApiEndpoints.baseUrl}');
  debugPrint('--------------------');
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'EnStore',
      themeMode: ThemeMode.light, // Force Light Mode
      theme: ThemeData(
        useMaterial3: true,
        fontFamily: 'Inter',
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.ocean500,
          primary: AppColors.ocean500,
          secondary: AppColors.brand500,
          surface: AppColors.smoke200,
          onSurface: AppColors.brand500,
          background: AppColors.smoke200,
        ),
        scaffoldBackgroundColor: AppColors.smoke200,
      ),
      home: const SplashScreen(),
    );
  }
}
