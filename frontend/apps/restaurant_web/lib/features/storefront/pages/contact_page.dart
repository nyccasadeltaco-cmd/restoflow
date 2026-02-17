// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;
// ignore: avoid_web_libraries_in_flutter
import 'dart:ui_web' as ui;
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../data/state/cart_store.dart';
import '../../../data/state/restaurant_website_provider.dart';
import '../../../data/models/restaurant_website_payload.dart';
import '../../../data/state/language_provider.dart';
import '../branding.dart';
import '../widgets/contact_links.dart';
import '../widgets/storefront_shell.dart';

class ContactPage extends StatelessWidget {
  final String slug;
  const ContactPage({super.key, required this.slug});

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
    final address = restaurant?.address ?? '';
    final hours = restaurant?.toHourRows(localeCode: lang.code) ?? const [];
    final restaurantInfo = restaurant?.toRestaurantInfo();
    final addressUrl = buildMapUrl(address);
    final phoneValue = restaurant?.phone ?? '646-791-0117';
    final phoneUrl = buildPhoneUrl(phoneValue);
    final emailValue = restaurant?.email ?? 'lacasadeltaco@gmail.com';
    final emailUrl = buildEmailUrl(emailValue);

    return StorefrontShell(
      restaurant: restaurantInfo,
      slug: slug,
      activeTab: 'contact',
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
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    lang.t('contact.title'),
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  _InfoCard(
                    icon: Icons.location_on,
                    title: lang.t('contact.address'),
                    value: address.isEmpty
                        ? lang.t('contact.addressUnavailable')
                        : address,
                    valueWidget: addressUrl == null
                        ? null
                        : LinkText(
                            text: address,
                            url: addressUrl,
                            style: const TextStyle(color: Colors.black87),
                          ),
                    colors: colors,
                  ),
                  _InfoCard(
                    icon: Icons.call,
                    title: lang.t('contact.phone'),
                    value: phoneValue,
                    valueWidget: phoneUrl == null
                        ? null
                        : LinkText(
                            text: phoneValue,
                            url: phoneUrl,
                            style: const TextStyle(color: Colors.black87),
                          ),
                    subtitle: lang.t('contact.phoneSubtitle'),
                    colors: colors,
                  ),
                  _InfoCard(
                    icon: Icons.email,
                    title: lang.t('contact.email'),
                    value: emailValue,
                    valueWidget: emailUrl == null
                        ? null
                        : LinkText(
                            text: emailValue,
                            url: emailUrl,
                            style: const TextStyle(color: Colors.black87),
                          ),
                    subtitle: lang.t('contact.emailSubtitle'),
                    colors: colors,
                  ),
                  const SizedBox(height: 24),
                  Text(
                    lang.t('contact.hours'),
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  _HoursList(hours: hours, colors: colors),
                ],
              ),
            ),
            const SizedBox(width: 24),
            Expanded(
              child: Column(
                children: [
                  _MapPanel(address: address),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: colors.success,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
                    ),
                    onPressed: () {},
                    icon: const Icon(Icons.chat, color: Colors.white),
                    label: Text(lang.t('contact.whatsapp')),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  final Widget? valueWidget;
  final String? subtitle;
  final BrandingColors colors;

  const _InfoCard({
    required this.icon,
    required this.title,
    required this.value,
    this.valueWidget,
    this.subtitle,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        color: colors.surface,
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: colors.accent.withOpacity(0.2),
            child: Icon(icon, color: colors.primary),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                valueWidget ?? Text(value, style: const TextStyle(color: Colors.black87)),
                if (subtitle != null) ...[
                  const SizedBox(height: 4),
                  Text(subtitle!, style: const TextStyle(color: Colors.black54, fontSize: 12)),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _HoursList extends StatelessWidget {
  final List<HourRow> hours;
  final BrandingColors colors;

  const _HoursList({required this.hours, required this.colors});

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    return Text(
      lang.t('contact.hoursLine'),
      style: const TextStyle(color: Colors.black87),
    );
  }
}

class _MapPanel extends StatefulWidget {
  final String address;
  const _MapPanel({required this.address});

  @override
  State<_MapPanel> createState() => _MapPanelState();
}

class _MapPanelState extends State<_MapPanel> {
  static final Set<String> _registeredViews = {};
  late final String _viewType;

  @override
  void initState() {
    super.initState();
    _viewType = 'contact-map-${widget.address.hashCode}';
    if (kIsWeb && widget.address.trim().isNotEmpty && !_registeredViews.contains(_viewType)) {
      ui.platformViewRegistry.registerViewFactory(_viewType, (int viewId) {
        final query = Uri.encodeComponent(widget.address.trim());
        final src = 'https://www.google.com/maps?q=$query&output=embed';
        final iframe = html.IFrameElement()
          ..src = src
          ..style.border = '0'
          ..style.width = '100%'
          ..style.height = '100%'
          ..allowFullscreen = true
          ..referrerPolicy = 'no-referrer-when-downgrade';
        return iframe;
      });
      _registeredViews.add(_viewType);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!kIsWeb || widget.address.trim().isEmpty) {
      final lang = context.watch<LanguageProvider>();
      return Container(
        height: 280,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          color: Colors.grey.shade200,
        ),
        child: Center(
          child: Text(lang.t('contact.mapLabel'),
              style: const TextStyle(color: Colors.black54)),
        ),
      );
    }

    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: SizedBox(
        height: 280,
        width: double.infinity,
        child: HtmlElementView(viewType: _viewType),
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

