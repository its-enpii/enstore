import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/network/api_client.dart';

class AppServiceItem extends StatelessWidget {
  final String title;
  final IconData? icon;
  final String? imageUrl;
  final VoidCallback onTap;

  const AppServiceItem({
    super.key,
    required this.title,
    this.icon,
    this.imageUrl,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    String? finalImageUrl = imageUrl;
    if (finalImageUrl != null &&
        finalImageUrl.isNotEmpty &&
        !finalImageUrl.startsWith('http')) {
      finalImageUrl =
          '${ApiClient.baseUrl.replaceAll('/api', '')}/storage/$finalImageUrl';
    }

    final bool isSvg = finalImageUrl?.toLowerCase().endsWith('.svg') ?? false;

    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: (MediaQuery.of(context).size.width - 48) / 4,
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.cloud200,
                borderRadius: BorderRadius.circular(16),
              ),
              child: SizedBox(
                height: 24,
                width: 24,
                child: finalImageUrl != null && finalImageUrl.isNotEmpty
                    ? (isSvg
                        ? SvgPicture.network(
                            finalImageUrl,
                            fit: BoxFit.contain,
                            placeholderBuilder:
                                (context) => const Center(
                                  child: SizedBox(
                                    width: 12,
                                    height: 12,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                    ),
                                  ),
                                ),
                          )
                        : Image.network(
                            finalImageUrl,
                            fit: BoxFit.contain,
                            errorBuilder:
                                (context, error, stackTrace) => const Icon(
                                  Icons.broken_image_rounded,
                                  size: 24,
                                ),
                          ))
                    : Icon(
                        icon ?? Icons.help_outline_rounded,
                        color: AppColors.brand500.withValues(alpha: 0.8),
                        size: 24,
                      ),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: AppColors.brand500.withValues(alpha: 0.6),
              ),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
