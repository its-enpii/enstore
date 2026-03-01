import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

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

  void _showBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) => _DropdownBottomSheet<T>(
        items: items,
        selectedValue: value,
        onSelected: onChanged,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Cari label dari item yang sedang dipilih
    String? selectedLabel;
    if (value != null) {
      final matched = items.where((item) => item.value == value);
      if (matched.isNotEmpty) {
        final child = matched.first.child;
        if (child is Text) selectedLabel = child.data;
      }
    }

    final trigger = GestureDetector(
      onTap: items.isEmpty ? null : () => _showBottomSheet(context),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        decoration: BoxDecoration(
          color: AppColors.cloud200,
          borderRadius: BorderRadius.circular(32),
        ),
        child: Row(
          children: [
            if (prefixIcon != null) ...[
              IconTheme(
                data: IconThemeData(
                  color: AppColors.brand500.withValues(alpha: 0.4),
                  size: 20,
                ),
                child: prefixIcon!,
              ),
              const SizedBox(width: 12),
            ],
            Expanded(
              child: Text(
                selectedLabel ?? hintText,
                style: TextStyle(
                  color: selectedLabel != null
                      ? AppColors.brand500.withValues(alpha: 0.9)
                      : AppColors.brand500.withValues(alpha: 0.3),
                  fontSize: 16,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            Icon(
              Icons.keyboard_arrow_down_rounded,
              color: AppColors.brand500.withValues(alpha: 0.3),
            ),
          ],
        ),
      ),
    );

    if (label == null) return trigger;

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
        trigger,
      ],
    );
  }
}

class _DropdownBottomSheet<T> extends StatefulWidget {
  final List<DropdownMenuItem<T>> items;
  final T? selectedValue;
  final void Function(T?)? onSelected;

  const _DropdownBottomSheet({
    required this.items,
    this.selectedValue,
    this.onSelected,
  });

  @override
  State<_DropdownBottomSheet<T>> createState() =>
      _DropdownBottomSheetState<T>();
}

class _DropdownBottomSheetState<T> extends State<_DropdownBottomSheet<T>> {
  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.6,
      ),
      decoration: const BoxDecoration(
        color: AppColors.smoke200,
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(height: 12),
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: AppColors.brand500.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 16),
          Flexible(
            child: ListView.builder(
              shrinkWrap: true,
              padding: const EdgeInsets.only(bottom: 32),
              physics: const BouncingScrollPhysics(),
              itemCount: widget.items.length,
              itemBuilder: (context, index) {
                final item = widget.items[index];
                final isSelected = item.value == widget.selectedValue;
                return ListTile(
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 4,
                  ),
                  trailing: isSelected
                      ? const Icon(Icons.check_rounded, color: AppColors.ocean500)
                      : null,
                  title: DefaultTextStyle(
                    style: TextStyle(
                      color: isSelected
                          ? AppColors.ocean500
                          : AppColors.brand500.withValues(alpha: 0.9),
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      fontSize: 16,
                    ),
                    child: item.child,
                  ),
                  onTap: () {
                    widget.onSelected?.call(item.value);
                    Navigator.pop(context);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
