import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../data/models/menu_models.dart';
import '../../../data/state/language_provider.dart';
import '../branding.dart';
import 'contact_links.dart';

class StorefrontShell extends StatelessWidget {
  final RestaurantInfo? restaurant;
  final String slug;
  final String activeTab;
  final int cartQty;
  final Widget child;
  final bool showFooter;
  final BrandingColors? colorsOverride;
  final String? nameOverride;
  final String? logoUrlOverride;
  final String? locationOverride;
  final String? phoneOverride;
  final String? emailOverride;
  final String? addressOverride;
  final String? hoursTextOverride;
  final List<HourRow>? hoursOverride;
  final String? footerDescription;
  final String? instagramUrl;
  final String? tiktokUrl;
  final Widget? floatingAction;

  const StorefrontShell({
    super.key,
    required this.restaurant,
    required this.slug,
    required this.activeTab,
    required this.cartQty,
    required this.child,
    this.showFooter = true,
    this.colorsOverride,
    this.nameOverride,
    this.logoUrlOverride,
    this.locationOverride,
    this.phoneOverride,
    this.emailOverride,
    this.addressOverride,
    this.hoursTextOverride,
    this.hoursOverride,
    this.footerDescription,
    this.instagramUrl,
    this.tiktokUrl,
    this.floatingAction,
  });

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final colors = colorsOverride ?? BrandingColors.fromRestaurant(restaurant);
    final name = nameOverride ?? restaurant?.name ?? lang.t('common.restaurant');
    final logoUrl = logoUrlOverride ?? restaurant?.logoUrl ?? '';
    final location = locationOverride ?? formatLocation(restaurant);
    final phone = phoneOverride ?? restaurant?.phone ?? '';
    final email = emailOverride ?? restaurant?.email ?? '';
    final address = addressOverride ?? formatAddress(restaurant);
    final hoursSource = restaurant?.operatingHours;
    final hasHoursSource = hoursSource != null && hoursSource.isNotEmpty;
    final hoursText = hasHoursSource
        ? formatHoursSummary(hoursSource, localeCode: lang.code)
        : (hoursTextOverride ?? '');
    final hoursRows = hasHoursSource
        ? buildHourRows(hoursSource, localeCode: lang.code)
        : (hoursOverride ?? const []);
    final hasTopBar = phone.trim().isNotEmpty || address.trim().isNotEmpty;
    final isNarrow = MediaQuery.of(context).size.width < 700;
    final topBarHeight = hasTopBar ? (isNarrow ? 80.0 : 44.0) : 0.0;
    final navBarHeight = isNarrow ? 72.0 : 96.0;
    final topOffset = topBarHeight + navBarHeight;

    return Scaffold(
      backgroundColor: colors.background,
      body: Stack(
        children: [
          Positioned.fill(
            child: Padding(
              padding: EdgeInsets.only(top: topOffset),
              child: showFooter
                  ? SingleChildScrollView(
                      child: Column(
                        children: [
                          child,
                          _FooterSection(
                            name: name,
                            location: location,
                            phone: phone,
                            email: email,
                            address: address,
                            hours: hoursRows,
                            hoursText: hoursText,
                            colors: colors,
                            description: footerDescription ?? '',
                            instagramUrl: instagramUrl,
                            tiktokUrl: tiktokUrl,
                            logoUrl: logoUrl,
                            slug: slug,
                          ),
                        ],
                      ),
                    )
                  : child,
            ),
          ),
          Positioned(
            left: 0,
            right: 0,
            top: 0,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (hasTopBar)
                  SizedBox(
                    height: topBarHeight,
                    width: double.infinity,
                    child: _TopBar(
                      phone: phone,
                      address: address,
                      hours: '',
                      colors: colors,
                    ),
                  ),
                SizedBox(
                  height: navBarHeight,
                  child: _NavBar(
                    logoUrl: logoUrl,
                    name: name,
                    location: location,
                    slug: slug,
                    activeTab: activeTab,
                    cartQty: cartQty,
                    colors: colors,
                  ),
                ),
              ],
            ),
          ),
          Positioned(
            right: 20,
            bottom: 20,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (floatingAction != null) ...[
                  floatingAction!,
                  const SizedBox(height: 12),
                ],
                _WhatsappFab(color: colors.success),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _go(BuildContext context, String path) {
    Navigator.of(context).pushNamed(path);
  }

}

class _TopBar extends StatelessWidget {
  final String phone;
  final String address;
  final String hours;
  final BrandingColors colors;

  const _TopBar({
    required this.phone,
    required this.address,
    required this.hours,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    final hasPhone = phone.trim().isNotEmpty;
    final hasAddress = address.trim().isNotEmpty;
    final hasHours = hours.trim().isNotEmpty;
    if (!hasPhone && !hasAddress && !hasHours) {
      return const SizedBox.shrink();
    }
    return LayoutBuilder(
      builder: (context, constraints) {
        final isNarrow = constraints.maxWidth < 600;
        final content = <Widget>[];
        if (hasPhone) {
          final telUrl = 'tel:${phone.trim()}';
          content.add(
            _TopBarItem(
              icon: Icons.call,
              text: phone,
              onTap: () => launchUrl(
                Uri.parse(telUrl),
                mode: LaunchMode.platformDefault,
              ),
            ),
          );
        }
        if (hasAddress) {
          final mapQuery = Uri.encodeComponent(address);
          final mapUrl = 'https://www.google.com/maps/search/?api=1&query=$mapQuery';
          content.add(
            _TopBarItem(
              icon: Icons.location_on,
              text: address,
              onTap: () => launchUrl(
                Uri.parse(mapUrl),
                mode: LaunchMode.platformDefault,
              ),
            ),
          );
        }
        if (hasHours) {
          content.add(_TopBarItem(icon: Icons.access_time, text: hours));
        }
        final List<Widget> contentWidgets = content
            .map<Widget>(
              (item) => Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: item,
              ),
            )
            .toList();

        return Container(
          color: colors.primary,
          padding: EdgeInsets.symmetric(horizontal: isNarrow ? 12 : 20, vertical: 6),
          child: isNarrow
              ? Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: contentWidgets,
                      ),
                    ),
                    const SizedBox(width: 8),
                    _LanguagePill(isTopBar: true),
                  ],
                )
              : Row(
                  children: [
                    if (hasPhone) ...[
                      _TopBarItem(
                        icon: Icons.call,
                        text: phone,
                        onTap: () => _launchExternal('tel:${phone.trim()}'),
                      ),
                      const SizedBox(width: 16),
                    ],
                    if (hasAddress) ...[
                      Expanded(
                        child: _TopBarItem(
                          icon: Icons.location_on,
                          text: address,
                          overflow: true,
                          onTap: () => _launchExternal(
                            'https://www.google.com/maps/search/?api=1&query=${Uri.encodeComponent(address)}',
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                    ] else
                      const Spacer(),
                    if (hasHours)
                      _TopBarItem(icon: Icons.access_time, text: hours),
                    const SizedBox(width: 16),
                    _LanguagePill(isTopBar: true),
                  ],
                ),
        );
      },
    );
  }

  void _launchExternal(String url) {
    launchUrl(
      Uri.parse(url),
      mode: LaunchMode.platformDefault,
      webOnlyWindowName: '_blank',
    );
  }
}

class _TopBarItem extends StatelessWidget {
  final IconData icon;
  final String text;
  final bool overflow;
  final VoidCallback? onTap;

  const _TopBarItem({
    required this.icon,
    required this.text,
    this.overflow = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final textStyle = TextStyle(
      color: Colors.white,
      fontSize: 12,
      decoration: onTap != null ? TextDecoration.underline : TextDecoration.none,
      decorationColor: Colors.white,
    );
    final content = Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: Colors.white, size: 16),
        const SizedBox(width: 6),
        Flexible(
          child: Text(
            text,
            style: textStyle,
            overflow: overflow ? TextOverflow.ellipsis : TextOverflow.visible,
          ),
        ),
      ],
    );

    if (onTap == null) {
      return content;
    }

    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 2, vertical: 2),
          child: content,
        ),
      ),
    );
  }
}

class _NavBar extends StatelessWidget {
  final String logoUrl;
  final String name;
  final String location;
  final String slug;
  final String activeTab;
  final int cartQty;
  final BrandingColors colors;

  const _NavBar({
    required this.logoUrl,
    required this.name,
    required this.location,
    required this.slug,
    required this.activeTab,
    required this.cartQty,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isNarrow = constraints.maxWidth < 700;
        final lang = context.watch<LanguageProvider>();
        return Container(
          color: colors.secondary,
          padding: EdgeInsets.symmetric(horizontal: isNarrow ? 12 : 20, vertical: 14),
          child: Row(
            children: [
              Expanded(
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: () => _go(context, '/r/$slug'),
                    borderRadius: BorderRadius.circular(12),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Row(
                        children: [
                          _BrandLogo(logoUrl: logoUrl),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  name,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: isNarrow ? 14 : 16,
                                  ),
                                ),
                                if (!isNarrow)
                                  Text(
                                    location,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      color: Colors.white70,
                                      fontSize: 12,
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              if (!isNarrow) ...[
                _NavItem(
                  label: lang.t('nav.home'),
                  active: activeTab == 'home',
                  onTap: () => _go(context, '/r/$slug'),
                  activeColor: colors.primary,
                ),
                _NavItem(
                  label: lang.t('nav.menu'),
                  active: activeTab == 'menu',
                  onTap: () => _go(context, '/r/$slug/menu'),
                  activeColor: colors.primary,
                ),
                _NavItem(
                  label: lang.t('nav.orders'),
                  active: activeTab == 'orders',
                  onTap: () => _go(context, '/r/$slug/order'),
                  activeColor: colors.primary,
                ),
                _NavItem(
                  label: lang.t('nav.contact'),
                  active: activeTab == 'contact',
                  onTap: () => _go(context, '/r/$slug/contact'),
                  activeColor: colors.primary,
                ),
                const Icon(Icons.person_outline, color: Colors.white),
                const SizedBox(width: 16),
              ] else ...[
                PopupMenuButton<String>(
                  icon: const Icon(Icons.menu, color: Colors.white),
                  onSelected: (value) => _go(context, value),
                  itemBuilder: (context) => [
                    PopupMenuItem(
                      value: '/r/$slug',
                      child: Text(lang.t('nav.home')),
                    ),
                    PopupMenuItem(
                      value: '/r/$slug/menu',
                      child: Text(lang.t('nav.menu')),
                    ),
                    PopupMenuItem(
                      value: '/r/$slug/order',
                      child: Text(lang.t('nav.orders')),
                    ),
                    PopupMenuItem(
                      value: '/r/$slug/contact',
                      child: Text(lang.t('nav.contact')),
                    ),
                  ],
                ),
              ],
              Stack(
                alignment: Alignment.topRight,
                children: [
                  IconButton(
                    icon: const Icon(Icons.shopping_cart_outlined, color: Colors.white),
                    onPressed: () => _go(context, '/r/$slug/cart'),
                  ),
                  if (cartQty > 0)
                    Positioned(
                      right: 4,
                      top: 4,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: colors.primary,
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          '$cartQty',
                          style: const TextStyle(color: Colors.white, fontSize: 12),
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(width: 4),
            ],
          ),
        );
      },
    );
  }

  void _go(BuildContext context, String path) {
    Navigator.of(context).pushNamed(path);
  }
}

class _NavItem extends StatelessWidget {
  final String label;
  final bool active;
  final VoidCallback onTap;
  final Color activeColor;

  const _NavItem({
    required this.label,
    required this.active,
    required this.onTap,
    required this.activeColor,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 10),
      child: InkWell(
        onTap: onTap,
        child: Text(
          label,
          style: TextStyle(
            color: active ? activeColor : Colors.white,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}

class _LanguagePill extends StatelessWidget {
  final bool isTopBar;

  const _LanguagePill({this.isTopBar = false});

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    return PopupMenuButton<String>(
      onSelected: (value) => lang.setCode(value),
      color: Colors.white,
      itemBuilder: (context) => const [
        PopupMenuItem(value: 'ES', child: Text('ES')),
        PopupMenuItem(value: 'EN', child: Text('EN')),
      ],
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isTopBar ? Colors.white24 : Colors.white10,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white24),
        ),
        child: Row(
          children: [
            const Icon(Icons.language, color: Colors.white, size: 16),
            const SizedBox(width: 6),
            Text(lang.code, style: const TextStyle(color: Colors.white, fontSize: 12)),
          ],
        ),
      ),
    );
  }
}

class _FooterSection extends StatelessWidget {
  final String name;
  final String location;
  final String phone;
  final String email;
  final String address;
  final List<HourRow> hours;
  final String hoursText;
  final BrandingColors colors;
  final String description;
  final String? instagramUrl;
  final String? tiktokUrl;
  final String logoUrl;
  final String slug;

  const _FooterSection({
    required this.name,
    required this.location,
    required this.phone,
    required this.email,
    required this.address,
    required this.hours,
    required this.hoursText,
    required this.colors,
    required this.description,
    this.instagramUrl,
    this.tiktokUrl,
    required this.logoUrl,
    required this.slug,
  });

  @override
  Widget build(BuildContext context) {
    final isNarrow = MediaQuery.of(context).size.width < 700;
    final resolvedHoursText = hoursText.trim();
    final resolvedInstagram = _normalizeInstagramUrl(instagramUrl);
    final resolvedTiktok = _normalizeTiktokUrl(tiktokUrl);
    final phoneUrl = buildPhoneUrl(phone);
    final addressUrl = buildMapUrl(address);
    final emailUrl = buildEmailUrl(email);
    final lang = context.watch<LanguageProvider>();
    return Container(
      color: colors.secondary,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
      child: Column(
        children: [
          if (isNarrow)
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: () => _go(context, '/r/$slug'),
                    borderRadius: BorderRadius.circular(12),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            name,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 10),
                          _BrandLogo(logoUrl: logoUrl),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  description.isEmpty ? location : description,
                  style: const TextStyle(color: Colors.white70),
                ),
                const SizedBox(height: 16),
                Text(
                  lang.t('footer.contact'),
                  style: TextStyle(color: colors.primary, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                if (phone.isNotEmpty)
                  phoneUrl == null
                      ? Text(phone, style: const TextStyle(color: Colors.white70))
                      : LinkText(
                          text: phone,
                          url: phoneUrl,
                          style: const TextStyle(color: Colors.white70),
                        ),
                if (phone.isNotEmpty) const SizedBox(height: 6),
                if (email.isNotEmpty)
                  emailUrl == null
                      ? Text(email, style: const TextStyle(color: Colors.white70))
                      : LinkText(
                          text: email,
                          url: emailUrl,
                          style: const TextStyle(color: Colors.white70),
                        ),
                if (email.isNotEmpty) const SizedBox(height: 6),
                if (address.isNotEmpty)
                  addressUrl == null
                      ? Text(address, style: const TextStyle(color: Colors.white70))
                      : LinkText(
                          text: address,
                          url: addressUrl,
                          style: const TextStyle(color: Colors.white70),
                        ),
                const SizedBox(height: 16),
                Text(
                  lang.t('footer.hours'),
                  style: TextStyle(color: colors.primary, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  resolvedHoursText.isEmpty
                      ? lang.t('footer.hoursUnavailable')
                      : resolvedHoursText,
                  style: const TextStyle(color: Colors.white70),
                ),
                const SizedBox(height: 16),
                Text(
                  lang.t('footer.followUs'),
                  style: TextStyle(color: colors.primary, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    if (resolvedInstagram != null)
                      _SocialIcon(
                        icon: Icons.camera_alt,
                        onTap: () => _launchUrl(resolvedInstagram),
                      ),
                    if (resolvedInstagram != null && resolvedTiktok != null)
                      const SizedBox(width: 10),
                    if (resolvedTiktok != null)
                      _SocialIcon(
                        icon: Icons.music_note,
                        onTap: () => _launchUrl(resolvedTiktok),
                      ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(lang.t('footer.viewFullMenu'),
                    style: const TextStyle(color: Colors.white70)),
                const SizedBox(height: 6),
                Text(lang.t('footer.orderNow'), style: const TextStyle(color: Colors.white70)),
              ],
            )
          else
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Material(
                        color: Colors.transparent,
                        child: InkWell(
                          onTap: () => _go(context, '/r/$slug'),
                          borderRadius: BorderRadius.circular(12),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(vertical: 4),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  name,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 10),
                                _BrandLogo(logoUrl: logoUrl),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        description.isEmpty ? location : description,
                        style: const TextStyle(color: Colors.white70),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        lang.t('footer.contact'),
                        style: TextStyle(color: colors.primary, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      if (phone.isNotEmpty)
                        phoneUrl == null
                            ? Text(phone, style: const TextStyle(color: Colors.white70))
                            : LinkText(
                                text: phone,
                                url: phoneUrl,
                                style: const TextStyle(color: Colors.white70),
                              ),
                      if (phone.isNotEmpty) const SizedBox(height: 6),
                      if (email.isNotEmpty)
                        emailUrl == null
                            ? Text(email, style: const TextStyle(color: Colors.white70))
                            : LinkText(
                                text: email,
                                url: emailUrl,
                                style: const TextStyle(color: Colors.white70),
                              ),
                      if (email.isNotEmpty) const SizedBox(height: 6),
                      if (address.isNotEmpty)
                        addressUrl == null
                            ? Text(address, style: const TextStyle(color: Colors.white70))
                            : LinkText(
                                text: address,
                                url: addressUrl,
                                style: const TextStyle(color: Colors.white70),
                              ),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        lang.t('footer.hours'),
                        style: TextStyle(color: colors.primary, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      if (hours.isEmpty)
                        Text(lang.t('footer.hoursUnavailable'),
                            style: const TextStyle(color: Colors.white70))
                      else
                        ...hours.map(
                          (row) => Padding(
                            padding: const EdgeInsets.only(bottom: 6),
                            child: Text(
                              '${row.dayLabel}: ${row.range}',
                              style: const TextStyle(color: Colors.white70),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        lang.t('footer.followUs'),
                        style: TextStyle(color: colors.primary, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          if (resolvedInstagram != null)
                            _SocialIcon(
                              icon: Icons.camera_alt,
                              onTap: () => _launchUrl(resolvedInstagram),
                            ),
                          if (resolvedInstagram != null && resolvedTiktok != null)
                            const SizedBox(width: 10),
                          if (resolvedTiktok != null)
                            _SocialIcon(
                              icon: Icons.music_note,
                              onTap: () => _launchUrl(resolvedTiktok),
                            ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(lang.t('footer.viewFullMenu'),
                          style: const TextStyle(color: Colors.white70)),
                      const SizedBox(height: 6),
                      Text(lang.t('footer.orderNow'),
                          style: const TextStyle(color: Colors.white70)),
                    ],
                  ),
                ),
              ],
            ),
          const SizedBox(height: 24),
          const Divider(color: Colors.white24),
          const SizedBox(height: 12),
          Text(
            lang.t('footer.rights', vars: {'name': name}),
            style: const TextStyle(color: Colors.white54),
          ),
        ],
      ),
    );
  }

  void _go(BuildContext context, String path) {
    Navigator.of(context).pushNamed(path);
  }

  String? _normalizeInstagramUrl(String? value) {
    if (value == null) return null;
    final trimmed = value.trim();
    if (trimmed.isEmpty) return null;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    if (trimmed.startsWith('@')) {
      return 'https://www.instagram.com/${trimmed.substring(1)}';
    }
    return 'https://www.instagram.com/$trimmed';
  }

  String? _normalizeTiktokUrl(String? value) {
    if (value == null) return null;
    final trimmed = value.trim();
    if (trimmed.isEmpty) return null;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    if (trimmed.startsWith('@')) {
      return 'https://www.tiktok.com/${trimmed}';
    }
    return 'https://www.tiktok.com/@$trimmed';
  }

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    await launchUrl(uri, mode: LaunchMode.platformDefault);
  }
}

class _SocialIcon extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;

  const _SocialIcon({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(999),
      child: CircleAvatar(
        radius: 16,
        backgroundColor: Colors.white12,
        child: Icon(icon, color: Colors.white, size: 16),
      ),
    );
  }

  void _go(BuildContext context, String path) {
    Navigator.of(context).pushNamed(path);
  }
}

class _BrandLogo extends StatelessWidget {
  final String logoUrl;

  const _BrandLogo({
    required this.logoUrl,
  });

  @override
  Widget build(BuildContext context) {
    final trimmed = logoUrl.trim();
    final width = MediaQuery.of(context).size.width;
    final preferredSize = width < 600 ? 56.0 : 64.0;

    Widget fallbackImage() {
      return Image.asset(
        'assets/restoflowlogo.jpg',
        fit: BoxFit.cover,
        filterQuality: FilterQuality.high,
      );
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        final maxH = constraints.maxHeight.isFinite
            ? constraints.maxHeight
            : preferredSize;
        final maxW = constraints.maxWidth.isFinite
            ? constraints.maxWidth
            : preferredSize;
        final size = preferredSize.clamp(24.0, maxH < maxW ? maxH : maxW);

        return Center(
          child: SizedBox.square(
            dimension: size,
            child: DecoratedBox(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white,
                border: Border.all(
                  color: Colors.black.withOpacity(0.18),
                  width: 1.2,
                ),
              ),
              child: ClipOval(
                child: Padding(
                  padding: const EdgeInsets.all(2.0),
                  child: trimmed.isNotEmpty
                      ? Image.network(
                          trimmed,
                          fit: BoxFit.cover,
                          filterQuality: FilterQuality.high,
                          errorBuilder: (_, __, ___) => fallbackImage(),
                        )
                      : fallbackImage(),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

class _WhatsappFab extends StatelessWidget {
  final Color color;
  const _WhatsappFab({required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 54,
      height: 54,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(999),
        boxShadow: const [
          BoxShadow(color: Colors.black26, blurRadius: 8, offset: Offset(0, 4)),
        ],
      ),
      child: const Icon(Icons.chat, color: Colors.white, size: 28),
    );
  }
}


