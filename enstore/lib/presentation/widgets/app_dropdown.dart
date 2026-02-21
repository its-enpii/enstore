import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class AppDropdown<T> extends StatelessWidget {
  final String? label;
  final T? value;
  final String hintText;
  final List<DropdownMenuItem<T>> items;
  final void Function(T?)? onChanged;
  final Widget? prefixIcon;

  const AppDropdown({
    super.key,
    this.label,
    this.value,
    required this.hintText,
    required this.items,
    this.onChanged,
    this.prefixIcon,
  });

  @override
  Widget build(BuildContext context) {
    final dropdown = Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: AppColors.cloud200,
        borderRadius: BorderRadius.circular(30),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButtonFormField<T>(
          value: value,
          items: items,
          onChanged: onChanged,
          icon: Icon(
            Icons.keyboard_arrow_down_rounded,
            color: AppColors.brand500.withValues(alpha: 0.3),
          ),
          style: const TextStyle(color: AppColors.brand500, fontSize: 14),
          decoration: InputDecoration(
            hintText: hintText,
            hintStyle: TextStyle(
              color: AppColors.brand500.withValues(alpha: 0.3),
              fontSize: 14,
            ),
            prefixIcon: prefixIcon != null
                ? IconTheme(
                    data: IconThemeData(
                      color: AppColors.brand500.withValues(alpha: 0.4),
                      size: 20,
                    ),
                    child: prefixIcon!,
                  )
                : null,
            prefixIconConstraints: const BoxConstraints(
              minWidth: 52,
              minHeight: 48,
            ),
            border: InputBorder.none,
            isDense: true,
            contentPadding: const EdgeInsets.symmetric(
              vertical: 12,
              horizontal: 0,
            ),
          ),
          dropdownColor: AppColors.cloud200,
          borderRadius: BorderRadius.circular(20),
        ),
      ),
    );

    if (label == null) return dropdown;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          label!,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: AppColors.brand500.withValues(alpha: 0.9),
          ),
        ),
        const SizedBox(height: 8),
        dropdown,
      ],
    );
  }
}
