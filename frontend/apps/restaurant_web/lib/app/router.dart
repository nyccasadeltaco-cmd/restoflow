import 'package:flutter/material.dart';
import '../features/storefront/pages/store_home_page.dart';
import '../features/storefront/pages/menu_page.dart';
import '../features/storefront/pages/checkout_page.dart';
import '../features/storefront/pages/order_success_page.dart';
import '../features/storefront/pages/order_info_page.dart';
import '../features/storefront/pages/contact_page.dart';
import '../features/storefront/pages/payment_success_page.dart';
import '../features/storefront/pages/payment_cancel_page.dart';

const String _defaultSlug =
    String.fromEnvironment('DEFAULT_SLUG', defaultValue: 'casadeltaconyc');

Route<dynamic> onGenerateRoute(RouteSettings settings) {
  final uri = Uri.parse(settings.name ?? '/');
  final hostSlug = _slugFromHost();

  if (uri.path == '/' || uri.pathSegments.isEmpty) {
    return MaterialPageRoute(builder: (_) => StoreHomePage(slug: hostSlug));
  }

  String slug = hostSlug;
  if (uri.pathSegments.isNotEmpty && uri.pathSegments[0] == 'r') {
    if (uri.pathSegments.length >= 2) {
      slug = uri.pathSegments[1];
    }
  }

  final path = uri.pathSegments.join('/');

  if (path.contains('/menu')) {
    return MaterialPageRoute(builder: (_) => MenuPage(slug: slug));
  }
  if (path.contains('/cart')) {
    return MaterialPageRoute(builder: (_) => CheckoutPage(slug: slug));
  }
  if (path.contains('/order')) {
    return MaterialPageRoute(builder: (_) => OrderInfoPage(slug: slug));
  }
  if (path.contains('/contact')) {
    return MaterialPageRoute(builder: (_) => ContactPage(slug: slug));
  }
  if (path.contains('/payment-success')) {
    final sessionId = uri.queryParameters['session_id'];
    final slugOverride = uri.queryParameters['slug'];
    return MaterialPageRoute(
      builder: (_) => PaymentSuccessPage(
        slug: slugOverride?.isNotEmpty == true ? slugOverride! : slug,
        sessionId: sessionId,
      ),
    );
  }
  if (path.contains('/payment-cancel')) {
    final slugOverride = uri.queryParameters['slug'];
    return MaterialPageRoute(
      builder: (_) => PaymentCancelPage(
        slug: slugOverride?.isNotEmpty == true ? slugOverride! : slug,
      ),
    );
  }
  if (path.contains('/success')) {
    final orderId = uri.pathSegments.isNotEmpty ? uri.pathSegments.last : '';
    return MaterialPageRoute(
      builder: (_) => OrderSuccessPage(slug: slug, orderId: orderId),
    );
  }

  return MaterialPageRoute(builder: (_) => StoreHomePage(slug: slug));
}

String _slugFromHost() {
  final host = Uri.base.host;
  if (host.isEmpty || host == 'localhost' || host == '127.0.0.1') {
    return _defaultSlug;
  }
  final parts = host.split('.');
  if (parts.isEmpty) return _defaultSlug;
  return parts.first;
}
