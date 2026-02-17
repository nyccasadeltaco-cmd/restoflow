import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:responsive_framework/responsive_framework.dart';
import 'app/router.dart';
import 'data/state/cart_store.dart';
import 'data/state/tenant_menu_provider.dart';
import 'data/state/restaurant_website_provider.dart';
import 'data/state/language_provider.dart';

const String _defaultSlug =
    String.fromEnvironment('DEFAULT_SLUG', defaultValue: 'casadeltaconyc');

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => CartStore()),
        ChangeNotifierProvider(create: (_) => TenantMenuProvider()),
        ChangeNotifierProvider(create: (_) => RestaurantWebsiteProvider()),
        ChangeNotifierProvider(create: (_) => LanguageProvider()),
      ],
      child: const RestaurantWebApp(),
    ),
  );
}

class RestaurantWebApp extends StatelessWidget {
  const RestaurantWebApp({super.key});

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
      initialRoute: '/r/$_defaultSlug',
    );
  }
}
