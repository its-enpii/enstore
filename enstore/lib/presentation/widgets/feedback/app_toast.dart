import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

class AppToast {
  static void show(
    BuildContext context, {
    required String message,
    IconData? icon,
    Color? backgroundColor,
    Color? textColor,
    Duration duration = const Duration(seconds: 3),
  }) {
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    
    scaffoldMessenger.clearSnackBars();
    scaffoldMessenger.showSnackBar(
      SnackBar(
        content: Row(
          children: [
            if (icon != null) ...[
              Icon(
                icon,
                color: textColor ?? AppColors.smoke50,
                size: 20,
              ),
              const SizedBox(width: 12),
            ],
            Expanded(
              child: Text(
                message,
                style: TextStyle(
                  color: textColor ?? AppColors.smoke50,
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
        backgroundColor: backgroundColor ?? AppColors.brand500,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
        ),
        margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        duration: duration,
        elevation: 10,
      ),
    );
  }

  static void success(BuildContext context, String message) {
    show(
      context,
      message: message,
      icon: Icons.check_circle_rounded,
      backgroundColor: AppColors.success,
    );
  }

  static void error(BuildContext context, String message) {
    show(
      context,
      message: message,
      icon: Icons.error_rounded,
      backgroundColor: AppColors.error,
    );
  }

  static void info(BuildContext context, String message) {
    show(
      context,
      message: message,
      icon: Icons.info_rounded,
      backgroundColor: AppColors.ocean500,
    );
  }

  static void warning(BuildContext context, String message) {
    show(
      context,
      message: message,
      icon: Icons.warning_rounded,
      backgroundColor: AppColors.warning,
      textColor: AppColors.brand500,
    );
  }
}
