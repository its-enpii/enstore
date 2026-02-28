import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

class AppAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final bool showBackButton;
  final VoidCallback? onBackPressed;
  final List<Widget>? actions;
  final Widget? leading;
  final double height;

  const AppAppBar({
    super.key,
    required this.title,
    this.showBackButton = true,
    this.onBackPressed,
    this.actions,
    this.leading,
    this.height = kToolbarHeight + 32,
  });

  @override
  Widget build(BuildContext context) {
    return PreferredSize(
      preferredSize: Size.fromHeight(height),
      child: AppBar(
        backgroundColor: AppColors.smoke200,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        leadingWidth: 72,
        automaticallyImplyLeading: false,
        leading:
            leading ??
            (showBackButton
                ? Padding(
                    padding: const EdgeInsets.only(left: 24),
                    child: AppAppBarButton(
                      icon: Icons.arrow_back_ios_new_rounded,
                      onPressed: onBackPressed ?? () => Navigator.pop(context),
                    ),
                  )
                : null),
        title: Text(
          title,
          style: TextStyle(
            color: AppColors.brand500.withValues(alpha: 0.9),
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: actions != null
            ? actions!
                  .map(
                    (action) => Padding(
                      padding: const EdgeInsets.only(right: 24),
                      child: action,
                    ),
                  )
                  .toList()
            : null,
      ),
    );
  }

  @override
  Size get preferredSize => Size.fromHeight(height);
}

class AppAppBarButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onPressed;
  final Color? iconColor;

  const AppAppBarButton({
    super.key,
    required this.icon,
    required this.onPressed,
    this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.cloud200,
      shape: const CircleBorder(),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onPressed,
        child: SizedBox(
          width: 48,
          height: 48,
          child: Icon(
            icon,
            size: 20,
            color: iconColor ?? AppColors.brand500.withValues(alpha: 0.9),
          ),
        ),
      ),
    );
  }
}
