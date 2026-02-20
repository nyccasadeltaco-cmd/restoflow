import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:responsive_framework/responsive_framework.dart';
import 'app/router.dart';
import 'data/state/cart_store.dart';
import 'data/state/tenant_menu_provider.dart';
import 'data/state/restaurant_website_provider.dart';
import 'data/state/language_provider.dart';
import 'features/menu/public_resolve_service.dart';

const String _defaultSlug =
    String.fromEnvironment('DEFAULT_SLUG', defaultValue: 'casadeltaconyc');

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final resolvedSlug = await PublicResolveService.resolveInitialSlug();
  configureDefaultSlug(resolvedSlug);

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => CartStore()),
        ChangeNotifierProvider(create: (_) => TenantMenuProvider()),
        ChangeNotifierProvider(create: (_) => RestaurantWebsiteProvider()),
        ChangeNotifierProvider(create: (_) => LanguageProvider()),
      ],
      child: RestaurantWebApp(initialSlug: resolvedSlug),
    ),
  );
}

class RestaurantWebApp extends StatelessWidget {
  const RestaurantWebApp({super.key, required this.initialSlug});

  final String initialSlug;

  String _resolveInitialRoute() {
    final path = Uri.base.path;
    final query = Uri.base.hasQuery ? '?${Uri.base.query}' : '';
    if (path.isEmpty || path == '/') {
      return '/r/${initialSlug.trim().isEmpty ? _defaultSlug : initialSlug}$query';
    }
    return '$path$query';
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Restoflow Storefront',
      debugShowCheckedModeBanner: false,
      builder: (context, child) => ResponsiveBreakpoints.builder(
        child: child!,
        breakpoints: const [
          Breakpoint(start: 0, end: 480, name: MOBILE),
          Breakpoint(start: 481, end: 768, name: TABLET),
          Breakpoint(start: 769, end: 1024, name: DESKTOP),
          Breakpoint(start: 1025, end: double.infinity, name: 'XL'),
        ],
      ),
      onGenerateRoute: onGenerateRoute,
      initialRoute: _resolveInitialRoute(),
    );
  }
}
