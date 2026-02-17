import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../data/state/cart_store.dart';
import '../../../data/state/restaurant_website_provider.dart';
import '../../../data/models/restaurant_website_payload.dart';
import '../../../data/state/language_provider.dart';
import '../branding.dart';
import '../widgets/contact_links.dart';
import '../widgets/storefront_shell.dart';

class OrderInfoPage extends StatelessWidget {
  final String slug;
  const OrderInfoPage({super.key, required this.slug});

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final cart = context.watch<CartStore>();
    final websiteProvider = context.watch<RestaurantWebsiteProvider>();
    if (!websiteProvider.loading && websiteProvider.payload == null) {
      Future.microtask(() => websiteProvider.load(slug));
    }
    final payload = websiteProvider.payload;
    final restaurant = payload?.restaurant;
    final colors = restaurant != null
        ? _colorsFromPayload(restaurant)
        : BrandingColors.fromRestaurant(null);
    final restaurantInfo = restaurant?.toRestaurantInfo();
    final phoneValue = restaurant?.phone ?? '646-791-0117';
    final phoneUrl = buildPhoneUrl(phoneValue);

    return StorefrontShell(
      restaurant: restaurantInfo,
      slug: slug,
      activeTab: 'orders',
      cartQty: cart.totalQty,
      colorsOverride: colors,
      nameOverride: restaurant?.name,
      logoUrlOverride: restaurant?.logoUrl,
      locationOverride: restaurant?.subtitle,
      phoneOverride: restaurant?.phone,
      emailOverride: restaurant?.email,
      addressOverride: restaurant?.address,
      hoursTextOverride: restaurant?.hoursText,
      hoursOverride: restaurant?.toHourRows(localeCode: lang.code),
      footerDescription: restaurant?.hero.description,
      instagramUrl: restaurant?.social.instagram,
      tiktokUrl: restaurant?.social.tiktok,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 60),
        child: Column(
          children: [
            Text(
              lang.t('orders.infoTitle'),
              style: const TextStyle(fontSize: 18, color: Colors.black54),
            ),
            const SizedBox(height: 20),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              alignment: WrapAlignment.center,
              children: [
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: colors.secondary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  ),
                  onPressed: phoneUrl == null
                      ? null
                      : () => launchUrl(
                            Uri.parse(phoneUrl),
                            mode: LaunchMode.platformDefault,
                          ),
                  icon: const Icon(Icons.call),
                  label: Text(phoneValue),
                ),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: colors.success,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  ),
                  onPressed: () {},
                  icon: const Icon(Icons.chat),
                  label: Text(lang.t('orders.whatsapp')),
                ),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: colors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  ),
                  onPressed: () => Navigator.of(context).pushNamed('/r/$slug/menu'),
                  icon: const Icon(Icons.menu_book),
                  label: Text(lang.t('orders.menuButton')),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

BrandingColors _colorsFromPayload(RestaurantWebsiteRestaurant restaurant) {
  Color parseHex(String value, Color fallback) {
    var text = value.trim().toLowerCase();
    if (text.startsWith('#')) text = text.substring(1);
    if (text.length == 6) text = 'ff$text';
    if (text.length != 8) return fallback;
    final parsed = int.tryParse(text, radix: 16);
    if (parsed == null) return fallback;
    return Color(parsed);
  }

  return BrandingColors(
    primary: parseHex(restaurant.colors.primary, const Color(0xFFE4572E)),
    secondary: parseHex(restaurant.colors.bg, const Color(0xFF0B0B0B)),
    accent: parseHex(restaurant.colors.accent, const Color(0xFFF5C400)),
    background: parseHex(restaurant.colors.backgroundBase, const Color(0xFFF7F7F5)),
    surface: parseHex(restaurant.colors.surface, Colors.white),
    textPrimary: parseHex(restaurant.colors.text, const Color(0xFF111111)),
    textSecondary: parseHex(restaurant.colors.textMuted, const Color(0xFFB8B8B8)),
    success: const Color(0xFF25D366),
  );
}
