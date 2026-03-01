import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

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
  final bool readOnly;
  final String? helperText;

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
    this.readOnly = false,
    this.helperText,
  });

  @override
  Widget build(BuildContext context) {
    final textField = Container(
      decoration: BoxDecoration(
        color: AppColors.cloud200,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColors.brand500.withValues(alpha: 0.05),
          width: 1,
        ),
      ),
      child: TextFormField(
        controller: controller,
        obscureText: obscureText,
        keyboardType: keyboardType,
        textInputAction: textInputAction,
        onChanged: onChanged,
        validator: validator,
        readOnly: readOnly,
        style: TextStyle(
          color: AppColors.brand500.withValues(
            alpha: readOnly ? 0.4 : 0.9,
          ),
          fontSize: 16,
          fontWeight: FontWeight.w500,
        ),
        decoration: InputDecoration(
          hintText: hintText,
          hintStyle: TextStyle(
            color: AppColors.brand500.withValues(alpha: 0.2),
            fontSize: 16,
          ),
          prefixIcon: prefixIcon != null
              ? IconTheme(
                  data: IconThemeData(
                    color: AppColors.brand500.withValues(alpha: 0.3),
                    size: 20,
                  ),
                  child: Padding(
                    padding: const EdgeInsets.only(left: 4),
                    child: prefixIcon!,
                  ),
                )
              : null,
          prefixIconConstraints: const BoxConstraints(
            minWidth: 48,
          ),
          suffixIcon: suffixIcon != null
              ? IconTheme(
                  data: IconThemeData(
                    color: AppColors.brand500.withValues(alpha: 0.3),
                    size: 20,
                  ),
                  child: suffixIcon!,
                )
              : null,
          suffixIconConstraints: const BoxConstraints(
            minWidth: 48,
          ),
          border: InputBorder.none,
          isDense: true,
          contentPadding: const EdgeInsets.symmetric(
            vertical: 18,
            horizontal: 20,
          ),
        ),
      ),
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (label != null) ...[
          Text(
            label!.toUpperCase(),
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.2,
              color: AppColors.brand500.withValues(alpha: 0.5),
            ),
          ),
          const SizedBox(height: 10),
        ],
        textField,
        if (helperText != null) ...[
          const SizedBox(height: 6),
          Padding(
            padding: const EdgeInsets.only(left: 4),
            child: Text(
              helperText!,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: AppColors.brand500.withValues(alpha: 0.3),
              ),
            ),
          ),
        ],
      ],
    );
  }
}
