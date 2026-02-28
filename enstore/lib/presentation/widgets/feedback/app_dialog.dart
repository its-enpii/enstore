import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../buttons/app_button.dart';

enum AppDialogType { danger, warning, info, question }

class AppDialog extends StatelessWidget {
  final String title;
  final String? message;
  final Widget? content;
  final String confirmLabel;
  final String cancelLabel;
  final VoidCallback onConfirm;
  final VoidCallback? onCancel;
  final AppDialogType type;
  final bool isLoading;

  const AppDialog({
    super.key,
    required this.title,
    this.message,
    this.content,
    this.confirmLabel = 'Confirm',
    this.cancelLabel = 'Cancel',
    required this.onConfirm,
    this.onCancel,
    this.type = AppDialogType.question,
    this.isLoading = false,
  });

  static Future<void> show(
    BuildContext context, {
    required String title,
    String? message,
    Widget? content,
    String confirmLabel = 'Confirm',
    String cancelLabel = 'Cancel',
    required Future<void> Function() onConfirm,
    VoidCallback? onCancel,
    AppDialogType type = AppDialogType.question,
  }) {
    return showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        bool localLoading = false;
        return StatefulBuilder(
          builder: (context, setState) {
            return AppDialog(
              title: title,
              message: message,
              content: content,
              confirmLabel: confirmLabel,
              cancelLabel: cancelLabel,
              isLoading: localLoading,
              type: type,
              onCancel: localLoading
                  ? null
                  : (onCancel ?? () => Navigator.pop(context)),
              onConfirm: () async {
                if (localLoading) return;
                setState(() => localLoading = true);
                try {
                  await onConfirm();
                } finally {
                  if (context.mounted) {
                    setState(() => localLoading = false);
                  }
                }
              },
            );
          },
        );
      },
    );
  }

  IconData _getIcon() {
    switch (type) {
      case AppDialogType.danger:
        return Icons.error_outline_rounded;
      case AppDialogType.warning:
        return Icons.warning_amber_rounded;
      case AppDialogType.info:
        return Icons.info_outline_rounded;
      case AppDialogType.question:
        return Icons.help_outline_rounded;
    }
  }

  Color _getTypeColor() {
    switch (type) {
      case AppDialogType.danger:
        return AppColors.error;
      case AppDialogType.warning:
        return AppColors.warning;
      case AppDialogType.info:
        return AppColors.ocean500;
      case AppDialogType.question:
        return AppColors.brand500.withValues(alpha: 0.9);
    }
  }

  @override
  Widget build(BuildContext context) {
    final typeColor = _getTypeColor();

    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 24),
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: AppColors.smoke200,
          borderRadius: BorderRadius.circular(48),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Icon
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.cloud200,
                shape: BoxShape.circle,
              ),
              child: Icon(_getIcon(), size: 48, color: typeColor),
            ),
            const SizedBox(height: 16),

            // Title
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: AppColors.brand500,
              ),
            ),
            // Message or Custom Content
            if (content != null)
              content!
            else if (message != null)
              Text(
                message!,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  height: 1.5,
                  color: AppColors.brand500.withValues(alpha: 0.5),
                ),
              ),
            const SizedBox(height: 32),

            // Buttons
            Row(
              children: [
                Expanded(
                  child: AppButton(
                    label: cancelLabel,
                    backgroundColor: Colors.transparent,
                    foregroundColor: AppColors.brand500.withValues(alpha: 0.6),
                    disabledBackgroundColor: Colors.transparent,
                    disabledForegroundColor: AppColors.brand500.withValues(
                      alpha: 0.4,
                    ),
                    borderRadius: 999,
                    side: BorderSide(
                      color: AppColors.brand500.withValues(alpha: 0.1),
                      width: 1,
                    ),
                    onPressed: isLoading
                        ? null
                        : (onCancel ?? () => Navigator.pop(context)),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: AppButton(
                    label: confirmLabel,
                    backgroundColor: AppColors.ocean500,
                    isLoading: isLoading,
                    borderRadius: 999,
                    onPressed: onConfirm,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
