import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class AppTextField extends StatelessWidget {
  final String? label;
  final TextEditingController? controller;
  final String hintText;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final bool obscureText;
  final TextInputType keyboardType;
  final TextInputAction? textInputAction;
  final void Function(String)? onChanged;
  final String? Function(String?)? validator;

  const AppTextField({
    super.key,
    this.label,
    this.controller,
    required this.hintText,
    this.prefixIcon,
    this.suffixIcon,
    this.obscureText = false,
    this.keyboardType = TextInputType.text,
    this.textInputAction,
    this.onChanged,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    final textField = Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: AppColors.cloud200,
        borderRadius: BorderRadius.circular(32),
      ),
      child: TextFormField(
        controller: controller,
        obscureText: obscureText,
        keyboardType: keyboardType,
        textInputAction: textInputAction,
        onChanged: onChanged,
        validator: validator,
        style: TextStyle(
          color: AppColors.brand500.withValues(alpha: 0.9),
          fontSize: 16,
        ),
        decoration: InputDecoration(
          hintText: hintText,
          hintStyle: TextStyle(
            color: AppColors.brand500.withValues(alpha: 0.3),
            fontSize: 16,
          ),
          prefixIcon: prefixIcon != null
              ? IconTheme(
                  data: IconThemeData(
                    color: AppColors.brand500.withValues(alpha: 0.4),
                    size: 24,
                  ),
                  child: prefixIcon!,
                )
              : null,
          prefixIconConstraints: const BoxConstraints(
            minWidth: 32,
            minHeight: 32,
          ),
          suffixIcon: suffixIcon != null
              ? IconTheme(
                  data: IconThemeData(
                    color: AppColors.brand500.withValues(alpha: 0.4),
                    size: 24,
                  ),
                  child: suffixIcon!,
                )
              : null,
          suffixIconConstraints: const BoxConstraints(
            minWidth: 32,
            minHeight: 32,
          ),
          border: InputBorder.none,
          isDense: true,
          contentPadding: const EdgeInsets.symmetric(
            vertical: 16,
            horizontal: 16,
          ),
        ),
      ),
    );

    if (label == null) return textField;

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
        textField,
      ],
    );
  }
}
