import 'package:go_router/go_router.dart';
import 'features/storefront/pages/store_home_page.dart';
import 'features/storefront/pages/menu_page.dart';
import 'features/storefront/pages/checkout_page.dart';
import 'features/storefront/pages/order_success_page.dart';
import 'features/storefront/pages/payment_success_page.dart';
import 'features/storefront/pages/payment_cancel_page.dart';

final appRouter = GoRouter(
  routes: [
    GoRoute(
      path: '/r/:slug',
      builder: (_, s) => StoreHomePage(slug: s.pathParameters['slug']!),
    ),
    GoRoute(
      path: '/r/:slug/menu',
      builder: (_, s) => MenuPage(slug: s.pathParameters['slug']!),
    ),
    GoRoute(
      path: '/r/:slug/checkout',
      builder: (_, s) => CheckoutPage(slug: s.pathParameters['slug']!),
    ),
    GoRoute(
      path: '/r/:slug/success/:orderId',
      builder: (_, s) => OrderSuccessPage(
        slug: s.pathParameters['slug']!,
        orderId: s.pathParameters['orderId']!,
      ),
    ),
    GoRoute(
      path: '/payment-success',
      builder: (_, s) => PaymentSuccessPage(
        slug: s.uri.queryParameters['slug'] ?? 'casadeltaconyc',
        sessionId: s.uri.queryParameters['session_id'],
      ),
    ),
    GoRoute(
      path: '/payment-cancel',
      builder: (_, s) => PaymentCancelPage(
        slug: s.uri.queryParameters['slug'] ?? 'casadeltaconyc',
      ),
    ),
  ],
);
