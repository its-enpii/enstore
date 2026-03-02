import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/services/auth_service.dart';
import '../../../core/services/utility_service.dart';
import '../../../core/network/api_client.dart';
import '../../../core/models/banner.dart';
import '../app/main_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  // --- Controllers ---
  late AnimationController _bgController;
  late AnimationController _logoController;
  late AnimationController _glintController;
  late AnimationController _textController;
  late AnimationController _taglineController;
  late AnimationController _dotsController;

  // --- Animations ---
  late Animation<double> _bgScale;
  late Animation<double> _logoOpacity;
  late Animation<double> _logoScale;
  late Animation<double> _logoY;
  late Animation<double> _glint;
  late Animation<double> _enOpacity;
  late Animation<Offset> _enSlide;
  late Animation<double> _storeOpacity;
  late Animation<Offset> _storeSlide;
  late Animation<double> _taglineOpacity;
  late Animation<Offset> _taglineSlide;

  // --- Preloaded data ---
  bool _isLoggedIn = false;
  String _userName = 'Guest';
  String? _avatar;
  String _balance = '0';
  List<BannerModel> _banners = [];

  // --- Exit fade overlay (0 = transparent, 1 = white) ---
  double _fadeOverlay = 0.0;

  // Minimum time the splash stays visible
  static const _minSplashDuration = Duration(milliseconds: 2000);

  @override
  void initState() {
    super.initState();
    _setupAnimations();
    _runSequence();
    _preloadData();
  }

  void _setupAnimations() {
    // Background subtle zoom
    _bgController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    );
    _bgScale = Tween<double>(
      begin: 1.0,
      end: 1.06,
    ).animate(CurvedAnimation(parent: _bgController, curve: Curves.easeInOut));

    // Logo entrance
    _logoController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _logoOpacity = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(
        parent: _logoController,
        curve: const Interval(0, 0.5, curve: Curves.easeIn),
      ),
    );
    _logoScale = Tween<double>(begin: 0.3, end: 1.0).animate(
      CurvedAnimation(
        parent: _logoController,
        curve: const Interval(0, 0.7, curve: Curves.elasticOut),
      ),
    );
    _logoY = Tween<double>(begin: 30, end: 0).animate(
      CurvedAnimation(
        parent: _logoController,
        curve: const Interval(0, 0.6, curve: Curves.easeOut),
      ),
    );

    // Logo glint sweep
    _glintController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );
    _glint = Tween<double>(begin: -1.5, end: 2.0).animate(
      CurvedAnimation(parent: _glintController, curve: Curves.easeInOut),
    );

    // Brand text
    _textController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _enOpacity = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(
        parent: _textController,
        curve: const Interval(0, 0.6, curve: Curves.easeIn),
      ),
    );
    _enSlide = Tween<Offset>(
      begin: const Offset(-0.15, 0),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _textController, curve: Curves.easeOut));
    _storeOpacity = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(
        parent: _textController,
        curve: const Interval(0.3, 1.0, curve: Curves.easeIn),
      ),
    );
    _storeSlide = Tween<Offset>(begin: const Offset(0.15, 0), end: Offset.zero)
        .animate(
          CurvedAnimation(
            parent: _textController,
            curve: const Interval(0.3, 1.0, curve: Curves.easeOut),
          ),
        );

    // Tagline
    _taglineController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _taglineOpacity = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _taglineController, curve: Curves.easeIn),
    );
    _taglineSlide = Tween<Offset>(begin: const Offset(0, 0.4), end: Offset.zero)
        .animate(
          CurvedAnimation(parent: _taglineController, curve: Curves.easeOut),
        );

    // Loading dots
    _dotsController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat();
  }

  Future<void> _runSequence() async {
    _bgController.forward();

    await Future.delayed(const Duration(milliseconds: 150));
    _logoController.forward();

    await Future.delayed(const Duration(milliseconds: 700));
    _glintController.forward();

    await Future.delayed(const Duration(milliseconds: 300));
    _textController.forward();

    await Future.delayed(const Duration(milliseconds: 350));
    _taglineController.forward();
  }

  Future<void> _preloadData() async {
    final stopwatch = Stopwatch()..start();

    try {
      final apiClient = ApiClient();
      final authService = AuthService(apiClient);
      final utilityService = UtilityService(apiClient);

      // Start both futures in parallel (don't await yet)
      final isLoggedInFuture = authService.isLoggedIn();
      final bannersFuture = utilityService.getBanners();

      // Await each with their correct type
      final isLoggedIn = await isLoggedInFuture;
      final bannersResponse = await bannersFuture;

      if (isLoggedIn) {
        try {
          final meResponse = await authService.getMe();
          final user = meResponse.success ? meResponse.data : null;
          if (user != null) {
            _isLoggedIn = true;
            _userName = user.name ?? 'User';
            _avatar = user.avatar;
            _balance = user.balance ?? '0';
          }
        } catch (_) {}
      }

      if (bannersResponse.success) {
        _banners = bannersResponse.data ?? [];
      }
    } catch (_) {
      // Silently fail — home screen will retry
    }

    // Ensure minimum splash duration
    final elapsed = stopwatch.elapsed;
    if (elapsed < _minSplashDuration) {
      await Future.delayed(_minSplashDuration - elapsed);
    }

    _navigate();
  }

  void _navigate() {
    if (!mounted) return;
    _dotsController.stop();

    // Fade in a white overlay over the splash, then navigate
    setState(() => _fadeOverlay = 1.0);
    Future.delayed(const Duration(milliseconds: 500), () {
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          transitionDuration: Duration.zero,
          pageBuilder: (_, __, ___) => MainScreen(
            preloadedIsLoggedIn: _isLoggedIn,
            preloadedUserName: _userName,
            preloadedAvatar: _avatar,
            preloadedBalance: _balance,
            preloadedBanners: _banners,
          ),
        ),
      );
    });
  }

  @override
  void dispose() {
    _bgController.dispose();
    _logoController.dispose();
    _glintController.dispose();
    _textController.dispose();
    _taglineController.dispose();
    _dotsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      body: AnimatedBuilder(
        animation: _bgScale,
        builder: (context, child) =>
            Transform.scale(scale: _bgScale.value, child: child),
        child: Stack(
          children: [
            // Glow orb top-right
            Positioned(
              top: -80,
              right: -80,
              child: Container(
                width: 280,
                height: 280,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      AppColors.ocean500.withValues(alpha: 0.12),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),

            // Glow orb bottom-left
            Positioned(
              bottom: -60,
              left: -60,
              child: Container(
                width: 220,
                height: 220,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      AppColors.ocean500.withValues(alpha: 0.07),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),

            // Main content
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Logo with glint effect
                  AnimatedBuilder(
                    animation: Listenable.merge([
                      _logoController,
                      _glintController,
                    ]),
                    builder: (context, _) {
                      return Opacity(
                        opacity: _logoOpacity.value,
                        child: Transform.translate(
                          offset: Offset(0, _logoY.value),
                          child: Transform.scale(
                            scale: _logoScale.value,
                            child: _buildLogoWithGlint(),
                          ),
                        ),
                      );
                    },
                  ),

                  const SizedBox(height: 28),

                  // "En" + "Store"
                  AnimatedBuilder(
                    animation: _textController,
                    builder: (context, _) {
                      return Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Opacity(
                            opacity: _enOpacity.value,
                            child: SlideTransition(
                              position: _enSlide,
                              child: Text(
                                'En',
                                style: TextStyle(
                                  color: AppColors.brand500.withValues(
                                    alpha: 0.9,
                                  ),
                                  fontSize: 36,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: -0.5,
                                ),
                              ),
                            ),
                          ),
                          Opacity(
                            opacity: _storeOpacity.value,
                            child: SlideTransition(
                              position: _storeSlide,
                              child: const Text(
                                'Store',
                                style: TextStyle(
                                  color: AppColors.ocean500,
                                  fontSize: 36,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: -0.5,
                                ),
                              ),
                            ),
                          ),
                        ],
                      );
                    },
                  ),

                  const SizedBox(height: 6),

                  // Tagline
                  AnimatedBuilder(
                    animation: _taglineController,
                    builder: (context, _) {
                      return Opacity(
                        opacity: _taglineOpacity.value,
                        child: SlideTransition(
                          position: _taglineSlide,
                          child: Text(
                            'Premium Game Store',
                            style: TextStyle(
                              color: AppColors.brand500.withValues(alpha: 0.4),
                              fontSize: 12,
                              letterSpacing: 2.0,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),

            // Bottom loading dots
            Positioned(
              bottom: 52,
              left: 0,
              right: 0,
              child: AnimatedBuilder(
                animation: _taglineOpacity,
                builder: (context, _) => Opacity(
                  opacity: _taglineOpacity.value,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(3, (i) {
                      return AnimatedBuilder(
                        animation: _dotsController,
                        builder: (_, __) {
                          final phase = (_dotsController.value + i / 3) % 1.0;
                          final t = (phase < 0.5) ? phase * 2 : (1 - phase) * 2;
                          final size = 5.0 + t * 3.0;
                          return Container(
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            width: size,
                            height: size,
                            decoration: BoxDecoration(
                              color: AppColors.ocean500.withValues(
                                alpha: 0.25 + t * 0.75,
                              ),
                              shape: BoxShape.circle,
                            ),
                          );
                        },
                      );
                    }),
                  ),
                ),
              ),
            ),

            // Exit fade overlay — fades to white before navigation
            AnimatedOpacity(
              opacity: _fadeOverlay,
              duration: const Duration(milliseconds: 500),
              curve: Curves.easeInOut,
              child: const ColoredBox(
                color: Color(0xFFF1F5F9),
                child: SizedBox.expand(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLogoWithGlint() {
    return Stack(
      alignment: Alignment.center,
      children: [
        // Outer glow
        Container(
          width: 120,
          height: 120,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: AppColors.ocean500.withValues(alpha: 0.18),
                blurRadius: 40,
                spreadRadius: 8,
              ),
            ],
          ),
        ),
        // Logo box
        Container(
          width: 96,
          height: 96,
          decoration: BoxDecoration(
            color: const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(26),
            border: Border.all(
              color: AppColors.ocean500.withValues(alpha: 0.08),
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: AppColors.brand500.withValues(alpha: 0.08),
                blurRadius: 24,
                offset: const Offset(0, 8),
              ),
              BoxShadow(
                color: AppColors.ocean500.withValues(alpha: 0.12),
                blurRadius: 16,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: Image.asset(
              'assets/images/logo.png',
              fit: BoxFit.contain,
              errorBuilder: (_, __, ___) => const Icon(
                Icons.shopping_bag_rounded,
                size: 52,
                color: AppColors.ocean500,
              ),
            ),
          ),
        ),
        // Glint overlay
        AnimatedBuilder(
          animation: _glint,
          builder: (context, _) {
            return ClipRRect(
              borderRadius: BorderRadius.circular(26),
              child: SizedBox(
                width: 96,
                height: 96,
                child: CustomPaint(
                  painter: _GlintPainter(position: _glint.value),
                ),
              ),
            );
          },
        ),
      ],
    );
  }
}

class _GlintPainter extends CustomPainter {
  final double position;
  _GlintPainter({required this.position});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..shader =
          LinearGradient(
            colors: [
              Colors.white.withValues(alpha: 0),
              Colors.white.withValues(alpha: 0.45),
              Colors.white.withValues(alpha: 0),
            ],
            stops: const [0.0, 0.5, 1.0],
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
          ).createShader(
            Rect.fromLTWH(
              size.width * (position - 0.3),
              0,
              size.width * 0.6,
              size.height,
            ),
          )
      ..blendMode = BlendMode.srcOver;

    canvas.drawRect(
      Rect.fromLTWH(
        size.width * (position - 0.3),
        0,
        size.width * 0.6,
        size.height,
      ),
      paint,
    );
  }

  @override
  bool shouldRepaint(_GlintPainter old) => old.position != position;
}
