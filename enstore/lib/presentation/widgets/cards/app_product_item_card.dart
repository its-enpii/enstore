import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

class AppProductItemCard extends StatelessWidget {
  final bool isSelected;
  final Widget child;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry? padding;

  const AppProductItemCard({
    super.key,
    required this.isSelected,
    required this.child,
    this.onTap,
    this.padding,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: padding,
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.ocean500.withValues(alpha: 0.05)
              : AppColors.cloud200,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: isSelected ? AppColors.ocean500 : Colors.transparent,
            width: 2,
          ),
        ),
        child: child,
      ),
    );
  }
}
