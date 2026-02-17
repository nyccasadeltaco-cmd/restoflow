import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../data/state/cart_store.dart';
import '../../../data/state/tenant_menu_provider.dart';
import '../../../data/state/language_provider.dart';
import '../branding.dart';
import '../widgets/storefront_shell.dart';

class PaymentCancelPage extends StatelessWidget {
  final String slug;
  const PaymentCancelPage({super.key, required this.slug});

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartStore>();
    final menuProvider = context.watch<TenantMenuProvider>();
    final lang = context.watch<LanguageProvider>();
    final restaurant = menuProvider.restaurant;
    final colors = BrandingColors.fromRestaurant(restaurant);

    return StorefrontShell(
      restaurant: restaurant,
      slug: slug,
      activeTab: 'orders',
      cartQty: cart.totalQty,
      showFooter: false,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.cancel, color: Colors.redAccent, size: 80),
            const SizedBox(height: 16),
            Text(
              lang.t('payment.cancel.title'),
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              lang.t('payment.cancel.body'),
              style: const TextStyle(color: Colors.black54),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: colors.primary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              ),
              onPressed: () => Navigator.of(context).pushNamed('/r/$slug/cart'),
              child: Text(lang.t('payment.cancel.backToCart')),
            ),
          ],
        ),
      ),
    );
  }
}
