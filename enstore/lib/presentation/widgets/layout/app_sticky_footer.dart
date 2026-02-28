import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../buttons/app_button.dart';

class AppStickyFooter extends StatelessWidget {
  final String label;
  final String value;
  final String buttonLabel;
  final VoidCallback? onButtonPressed;
  final IconData? buttonIcon;

  const AppStickyFooter({
    super.key,
    required this.label,
    required this.value,
    required this.buttonLabel,
    this.onButtonPressed,
    this.buttonIcon = Icons.arrow_forward_rounded,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        decoration: BoxDecoration(
          color: AppColors.cloud200,
          border: Border.all(color: AppColors.brand500.withValues(alpha: 0.05)),
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: AppColors.brand500.withValues(alpha: 0.04),
              blurRadius: 16,
              offset: const Offset(0, 1),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label.toUpperCase(),
                    style: TextStyle(
                      fontSize: 12,
                      letterSpacing: 1.5,
                      color: AppColors.brand500.withValues(alpha: 0.4),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    value,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: AppColors.ocean500,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: AppButton(
                label: buttonLabel,
                borderRadius: 999,
                suffixIcon: buttonIcon,
                onPressed: onButtonPressed,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
