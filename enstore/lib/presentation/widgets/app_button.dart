import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class AppButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final IconData? prefixIcon;
  final IconData? suffixIcon;
  final Color backgroundColor;
  final Color foregroundColor;
  final Color disabledBackgroundColor;
  final Color disabledForegroundColor;
  final double borderRadius;
  final double? width;
  final double height;
  final bool isLoading;
  final double elevation;
  final BorderSide? side;

  const AppButton({
    super.key,
    required this.label,
    this.onPressed,
    this.prefixIcon,
    this.suffixIcon,
    this.backgroundColor = AppColors.ocean500,
    this.foregroundColor = AppColors.smoke200,
    this.disabledBackgroundColor = AppColors.ocean200,
    this.disabledForegroundColor = AppColors.smoke200,
    this.borderRadius = 24.0,
    this.width,
    this.height = 56.0,
    this.isLoading = false,
    this.elevation = 0,
    this.side,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width,
      height: height,
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          disabledBackgroundColor: disabledBackgroundColor,
          disabledForegroundColor: disabledForegroundColor,
          backgroundColor: backgroundColor,
          foregroundColor: foregroundColor,
          elevation: 0,
          shadowColor: Colors.transparent,
          surfaceTintColor: Colors.transparent,
          enabledMouseCursor: SystemMouseCursors.click,
          disabledMouseCursor: SystemMouseCursors.forbidden,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(borderRadius),
            side: side ?? BorderSide.none,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24),
        ).copyWith(elevation: WidgetStateProperty.all(0)),
        child: isLoading
            ? SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: foregroundColor,
                ),
              )
            : Row(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (prefixIcon != null) ...[
                    Icon(prefixIcon, size: 20),
                    const SizedBox(width: 8),
                  ],
                  Text(
                    label,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      letterSpacing: 0.5,
                    ),
                  ),
                  if (suffixIcon != null) ...[
                    const SizedBox(width: 8),
                    Icon(suffixIcon, size: 20),
                  ],
                ],
              ),
      ),
    );
  }
}
