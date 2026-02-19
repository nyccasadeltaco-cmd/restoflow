import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../data/state/cart_store.dart';
import '../../../data/state/restaurant_website_provider.dart';
import '../../../data/models/restaurant_website_payload.dart';
import '../../../data/models/menu_models.dart';
import '../../../data/state/language_provider.dart';
import '../branding.dart';
import '../widgets/contact_links.dart';
import '../widgets/storefront_shell.dart';

String _resolveHeroBadge(RestaurantWebsiteHero hero, LanguageProvider lang) {
  if (hero.badgeText.trim().isEmpty) return lang.t('home.heroBadge');
  return hero.badgeText;
}

String _resolveHeroDescription(RestaurantWebsiteHero hero, LanguageProvider lang) {
  if (hero.description.trim().isEmpty) return lang.t('home.heroDescription');
  return hero.description;
}

class StoreHomePage extends StatefulWidget {
  final String slug;
  const StoreHomePage({super.key, required this.slug});

  @override
  State<StoreHomePage> createState() => _StoreHomePageState();
}

class _StoreHomePageState extends State<StoreHomePage> {
  final GlobalKey _menuKey = GlobalKey();

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      final provider = context.read<RestaurantWebsiteProvider>();
      provider.load(widget.slug);
    });
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartStore>();
    final websiteProvider = context.watch<RestaurantWebsiteProvider>();
    final lang = context.watch<LanguageProvider>();

    if (websiteProvider.loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (websiteProvider.error != null) {
      return _ErrorState(
        message: websiteProvider.error!,
        onRetry: () => websiteProvider.load(widget.slug),
      );
    }

    final payload = websiteProvider.payload;
    if (payload == null) {
      return Center(child: Text(lang.t('errors.restaurantNotFound')));
    }

    final restaurant = payload.restaurant;
    final colors = _colorsFromPayload(restaurant);
    final restaurantInfo = restaurant.toRestaurantInfo();
    final heroBadge = _resolveHeroBadge(restaurant.hero, lang);
    final heroDescription = _resolveHeroDescription(restaurant.hero, lang);
    final categories = List<RestaurantWebsiteCategory>.from(payload.categories)
      ..sort((a, b) => a.displayOrder.compareTo(b.displayOrder));
    final items = List<RestaurantWebsiteItem>.from(payload.items)
      ..sort((a, b) => a.displayOrder.compareTo(b.displayOrder));
    final featuredSections = payload.featuredSections;
    final favoritesSection = featuredSections.firstWhere(
      (section) => section.key == 'favorites',
      orElse: () => const RestaurantWebsiteFeaturedSection(
        key: 'favorites',
        title: '',
        items: [],
      ),
    );
    final favoritesTitle = favoritesSection.title.isNotEmpty
        ? lang.translateSectionTitle(favoritesSection.title)
        : lang.t('home.houseFavorites');
    final combosSection = featuredSections.firstWhere(
      (section) => section.key == 'combos',
      orElse: () => const RestaurantWebsiteFeaturedSection(
        key: 'combos',
        title: '',
        items: [],
      ),
    );
    final dailySection = featuredSections.firstWhere(
      (section) => section.key == 'daily',
      orElse: () => const RestaurantWebsiteFeaturedSection(
        key: 'daily',
        title: '',
        items: [],
      ),
    );
    final fallbackFeatured = items
        .where((item) => item.tags.contains(payload.featured.mostOrderedTag))
        .take(payload.featured.limit)
        .map((item) => RestaurantWebsiteFeaturedItem(
              id: item.id,
              type: 'menu_item',
              title: item.name,
              subtitle: item.description,
              price: item.price,
              imageUrl: item.imageUrl,
              ctaLabel: lang.t('home.order'),
              requiresConfiguration: false,
            ))
        .toList();

    return StorefrontShell(
      restaurant: restaurantInfo,
      slug: widget.slug,
      activeTab: 'home',
      cartQty: cart.totalQty,
      floatingAction: dailySection.items.isEmpty
          ? null
          : _DailySpecialFab(
              label: dailySection.items.length > 1
                  ? lang.t('home.dailySpecials')
                  : lang.t('home.dailySpecial'),
              items: dailySection.items,
              onSelect: (item) => _handleFeaturedOrder(
                context,
                item,
                items,
                cart,
                widget.slug,
                'daily',
              ),
            ),
      colorsOverride: colors,
      nameOverride: restaurant.name,
      logoUrlOverride: restaurant.logoUrl,
      locationOverride: restaurant.subtitle,
      phoneOverride: restaurant.phone,
      emailOverride: restaurant.email,
      addressOverride: restaurant.address,
      hoursTextOverride: restaurant.hoursText,
      hoursOverride: restaurant.toHourRows(localeCode: lang.code),
      footerDescription: heroDescription,
      instagramUrl: restaurant.social.instagram,
      tiktokUrl: restaurant.social.tiktok,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _HeroSection(
            hero: restaurant.hero,
            badgeText: heroBadge,
            description: heroDescription,
            colors: colors,
            slug: widget.slug,
            onViewMenu: () => Navigator.of(context).pushNamed('/r/${widget.slug}/menu'),
          ),
          const SizedBox(height: 24),
          _InfoCards(
            etas: restaurant.etas,
            address: restaurant.address,
            colors: colors,
          ),
          const SizedBox(height: 32),
          _OurMenuSection(
            key: _menuKey,
            categories: categories,
            colors: colors,
            onSelect: (categoryId) {
              Navigator.of(context).pushNamed('/r/${widget.slug}/menu?categoryId=$categoryId');
            },
          ),
          const SizedBox(height: 32),
          if (favoritesSection.items.isNotEmpty || fallbackFeatured.isNotEmpty)
            _FeaturedSection(
              title: favoritesTitle,
              subtitle: lang.t('home.houseFavoritesSubtitle'),
              badgeLabel: lang.t('home.mostOrdered'),
              items: favoritesSection.items.isNotEmpty ? favoritesSection.items : fallbackFeatured,
              colors: colors,
              onOrder: (item) => _handleFeaturedOrder(
                context,
                item,
                items,
                cart,
                widget.slug,
                'favorites',
              ),
            ),
          if (combosSection.items.isNotEmpty) ...[
            const SizedBox(height: 32),
            _CombosBand(
              items: combosSection.items,
              colors: colors,
              onOrder: (item) => _handleFeaturedOrder(
                context,
                item,
                items,
                cart,
                widget.slug,
                'combos',
              ),
            ),
          ],
          const SizedBox(height: 32),
          const SizedBox(height: 32),
          _ReviewsSection(reviews: payload.reviews, colors: colors),
          const SizedBox(height: 32),
          _FinalCta(slug: widget.slug, colors: colors),
        ],
      ),
    );
  }

  void _scrollToMenu() {
    final context = _menuKey.currentContext;
    if (context == null) return;
    Scrollable.ensureVisible(context, duration: const Duration(milliseconds: 400));
  }

  void _handleFeaturedOrder(
    BuildContext context,
    RestaurantWebsiteFeaturedItem item,
    List<RestaurantWebsiteItem> items,
    CartStore cart,
    String slug,
    String sectionKey,
  ) {
    final lang = context.read<LanguageProvider>();
    if (item.type == 'combo') {
      cart.addCombo(
        id: item.id,
        name: item.title,
        description: item.subtitle,
        price: item.price,
        imageUrl: item.imageUrl,
      );
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(lang.t('menu.addedToCart', vars: {'item': item.title}))),
      );
      return;
    }

    if (item.requiresConfiguration) {
      Navigator.of(context).pushNamed('/r/$slug/menu?featured=$sectionKey');
      return;
    }

    if (item.type != 'menu_item') {
      Navigator.of(context).pushNamed('/r/$slug/menu?featured=$sectionKey');
      return;
    }

    final matched = items.firstWhere(
      (menuItem) => menuItem.id == item.id,
      orElse: () => RestaurantWebsiteItem(
        id: item.id,
        categoryId: '',
        name: item.title,
        slug: item.title.toLowerCase().replaceAll(' ', '-'),
        description: item.subtitle,
        price: item.price,
        imageUrl: item.imageUrl,
        tags: const [],
        isAvailable: true,
        displayOrder: 0,
      ),
    );

    cart.addMenuItem(MenuItemModel(
      id: matched.id,
      categoryId: matched.categoryId,
      name: matched.name,
      description: matched.description ?? '',
      price: matched.price,
      imageUrl: matched.imageUrl ?? '',
      isAvailable: matched.isAvailable,
      isActive: true,
      tags: matched.tags,
      allergens: const [],
      preparationTime: null,
    ));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(lang.t('menu.addedToCart', vars: {'item': item.title}))),
    );
  }
}

class _ErrorState extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorState({
    required this.message,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 460),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.wifi_off, size: 52, color: Colors.black54),
              const SizedBox(height: 12),
              Text(
                message,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 16, color: Colors.black87),
              ),
              const SizedBox(height: 16),
              FilledButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh),
                label: const Text('Reintentar'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DailySpecialFab extends StatelessWidget {
  final String label;
  final List<RestaurantWebsiteFeaturedItem> items;
  final ValueChanged<RestaurantWebsiteFeaturedItem> onSelect;

  const _DailySpecialFab({
    required this.label,
    required this.items,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => _showDailyMenu(context),
      borderRadius: BorderRadius.circular(999),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.black,
          borderRadius: BorderRadius.circular(999),
          boxShadow: const [
            BoxShadow(color: Colors.black26, blurRadius: 10, offset: Offset(0, 4)),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.local_fire_department, color: Colors.white, size: 18),
            const SizedBox(width: 8),
            Text(
              label,
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
            ),
          ],
        ),
      ),
    );
  }

  void _showDailyMenu(BuildContext context) {
    final lang = context.read<LanguageProvider>();
    showDialog<void>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: Text(label),
          content: SizedBox(
            width: 420,
            child: ListView.separated(
              shrinkWrap: true,
              itemCount: items.length,
              separatorBuilder: (_, __) => const Divider(height: 24),
              itemBuilder: (context, index) {
                final item = items[index];
                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        color: Colors.black12,
                      ),
                      child: (item.imageUrl ?? '').isNotEmpty
                          ? ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Image.network(
                                item.imageUrl!,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) =>
                                    const Icon(Icons.restaurant_menu),
                              ),
                            )
                          : const Icon(Icons.restaurant_menu),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item.title, style: const TextStyle(fontWeight: FontWeight.w600)),
                          if ((item.subtitle ?? '').isNotEmpty) ...[
                            const SizedBox(height: 4),
                            Text(
                              item.subtitle ?? '',
                              style: const TextStyle(color: Colors.black54, fontSize: 12),
                            ),
                          ],
                          const SizedBox(height: 6),
                          Text('\$${item.price.toStringAsFixed(2)}'),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    FilledButton(
                      onPressed: () {
                        onSelect(item);
                        Navigator.of(dialogContext).pop();
                      },
                      child: Text(lang.t('menu.add')),
                    ),
                  ],
                );
              },
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(),
              child: Text(lang.t('common.close')),
            ),
          ],
        );
      },
    );
  }
}

class _HeroSection extends StatelessWidget {
  final RestaurantWebsiteHero hero;
  final String badgeText;
  final String description;
  final BrandingColors colors;
  final String slug;
  final VoidCallback onViewMenu;

  const _HeroSection({
    required this.hero,
    required this.badgeText,
    required this.description,
    required this.colors,
    required this.slug,
    required this.onViewMenu,
  });

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    return LayoutBuilder(
      builder: (context, constraints) {
        final isNarrow = constraints.maxWidth < 700;
        final horizontal = isNarrow ? 20.0 : 48.0;
        final vertical = isNarrow ? 48.0 : 80.0;
        final titleSize = isNarrow ? 34.0 : 52.0;
        final descriptionSize = isNarrow ? 15.0 : 16.0;

        return Container(
          width: double.infinity,
          padding: EdgeInsets.symmetric(horizontal: horizontal, vertical: vertical),
          decoration: const BoxDecoration(
            color: Color(0xFF0B0B0B),
          ),
          child: Stack(
            children: [
              Positioned.fill(
                child: Container(
                  decoration: const BoxDecoration(
                    gradient: RadialGradient(
                      center: Alignment(0.8, -0.1),
                      radius: 1.2,
                      colors: [
                        Color.fromRGBO(120, 140, 0, 0.35),
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.star, color: colors.accent, size: 16),
                      const SizedBox(width: 8),
                      Text(
                        badgeText,
                        style: TextStyle(color: colors.accent, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    hero.title1,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: titleSize,
                      fontWeight: FontWeight.bold,
                      height: 1.1,
                    ),
                  ),
                  Text(
                    hero.title2,
                    style: TextStyle(
                      color: colors.primary,
                      fontSize: titleSize,
                      fontWeight: FontWeight.bold,
                      height: 1.1,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    description,
                    style: TextStyle(color: Colors.white70, fontSize: descriptionSize, height: 1.5),
                  ),
                  const SizedBox(height: 28),
                  if (isNarrow)
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: colors.primary,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                            ),
                            onPressed: onViewMenu,
                            child: Text(lang.t('home.viewMenu')),
                          ),
                        ),
                        const SizedBox(height: 12),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: colors.accent,
                              foregroundColor: Colors.black,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                            ),
                            onPressed: () => Navigator.of(context).pushNamed('/r/$slug/order'),
                            icon: const Icon(Icons.restaurant_menu),
                            label: Text(lang.t('home.orderNow')),
                          ),
                        ),
                      ],
                    )
                  else
                    Row(
                      children: [
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: colors.primary,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                          ),
                          onPressed: onViewMenu,
                          child: Text(lang.t('home.viewMenu')),
                        ),
                        const SizedBox(width: 12),
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: colors.accent,
                            foregroundColor: Colors.black,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                          ),
                          onPressed: () => Navigator.of(context).pushNamed('/r/$slug/order'),
                          icon: const Icon(Icons.restaurant_menu),
                          label: Text(lang.t('home.orderNow')),
                        ),
                      ],
                    ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}

class _InfoCards extends StatelessWidget {
  final RestaurantWebsiteEtas etas;
  final String address;
  final BrandingColors colors;

  const _InfoCards({
    required this.etas,
    required this.address,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isNarrow = screenWidth < 520;
    final spacing = isNarrow ? 12.0 : 16.0;
    final addressUrl = buildMapUrl(address);
    final lang = context.watch<LanguageProvider>();

    final cards = [
      _InfoCard(
        icon: Icons.timer,
        title: lang.t('home.pickup'),
        value: '${etas.pickupMin}-${etas.pickupMax} min',
        colors: colors,
        maxLines: 2,
        compact: isNarrow,
      ),
      _InfoCard(
        icon: Icons.delivery_dining,
        title: lang.t('home.delivery'),
        value: '${etas.deliveryMin}-${etas.deliveryMax} min',
        colors: colors,
        maxLines: 2,
        compact: isNarrow,
      ),
      _InfoCard(
        icon: Icons.location_on,
        title: lang.t('home.location'),
        value: address,
        valueWidget: addressUrl == null
            ? null
            : LinkText(
                text: address,
                url: addressUrl,
                style: const TextStyle(fontWeight: FontWeight.bold),
                textAlign: isNarrow ? TextAlign.center : TextAlign.left,
                maxLines: isNarrow ? 5 : 4,
                overflow: TextOverflow.ellipsis,
              ),
        colors: colors,
        maxLines: isNarrow ? 5 : 4,
        compact: isNarrow,
      ),
    ];

    return Container(
      color: const Color(0xFFF3F4F6),
      padding: EdgeInsets.symmetric(horizontal: isNarrow ? 16 : 32, vertical: 20),
      child: isNarrow
          ? Column(
              children: [
                for (var i = 0; i < cards.length; i++) ...[
                  SizedBox(width: double.infinity, child: cards[i]),
                  if (i != cards.length - 1) SizedBox(height: spacing),
                ],
              ],
            )
          : Wrap(
              spacing: spacing,
              runSpacing: spacing,
              children: [
                for (final card in cards)
                  SizedBox(
                    width: 220,
                    child: card,
                  ),
              ],
            ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  final Widget? valueWidget;
  final BrandingColors colors;
  final int maxLines;
  final bool compact;

  const _InfoCard({
    required this.icon,
    required this.title,
    required this.value,
    this.valueWidget,
    required this.colors,
    this.maxLines = 2,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    if (compact) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            CircleAvatar(
              backgroundColor: colors.accent.withOpacity(0.2),
              child: Icon(icon, color: colors.primary),
            ),
            const SizedBox(height: 10),
            Text(title, style: const TextStyle(color: Colors.black54)),
            const SizedBox(height: 6),
            valueWidget ??
                Text(
                  value,
                  maxLines: maxLines,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
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
                Text(title, style: const TextStyle(color: Colors.black54)),
                const SizedBox(height: 4),
                valueWidget ??
                    Text(
                      value,
                      maxLines: maxLines,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _OurMenuSection extends StatelessWidget {
  final List<RestaurantWebsiteCategory> categories;
  final BrandingColors colors;
  final ValueChanged<String> onSelect;

  const _OurMenuSection({
    super.key,
    required this.categories,
    required this.colors,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth;
        final isPhoneNarrow = width < 480;
        final horizontal = isPhoneNarrow ? 12.0 : (width < 600 ? 16.0 : 32.0);
        var columns = 2;
        if (isPhoneNarrow) columns = 1;
        if (width >= 800) columns = 3;
        if (width >= 1100) columns = 4;
        final aspectRatio = isPhoneNarrow ? 1.6 : (width < 420 ? 1.2 : 1.4);

        return Padding(
          padding: EdgeInsets.symmetric(horizontal: horizontal),
          child: Column(
            children: [
          Text(lang.t('home.ourMenuTitle'),
              style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(
            lang.t('home.ourMenuSubtitle'),
            style: const TextStyle(color: Colors.black54),
            textAlign: TextAlign.center,
          ),
              const SizedBox(height: 24),
              Align(
                alignment: Alignment.center,
                child: ConstrainedBox(
                  constraints: BoxConstraints(
                    maxWidth: isPhoneNarrow ? 420 : double.infinity,
                  ),
                  child: GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: categories.length,
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: columns,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                      childAspectRatio: aspectRatio,
                    ),
                    itemBuilder: (context, index) {
                      final category = categories[index];
                      return GestureDetector(
                        onTap: () => onSelect(category.id),
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.05),
                                blurRadius: 12,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              CircleAvatar(
                                radius: 28,
                                backgroundColor: colors.accent.withOpacity(0.2),
                                child: const Icon(Icons.local_dining, color: Colors.black87),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                context.watch<LanguageProvider>().translateCategory(category.name),
                                textAlign: TextAlign.center,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(fontWeight: FontWeight.w600),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _FeaturedSection extends StatelessWidget {
  final String title;
  final String subtitle;
  final String badgeLabel;
  final List<RestaurantWebsiteFeaturedItem> items;
  final ValueChanged<RestaurantWebsiteFeaturedItem> onOrder;
  final BrandingColors colors;

  const _FeaturedSection({
    required this.title,
    required this.subtitle,
    required this.badgeLabel,
    required this.items,
    required this.colors,
    required this.onOrder,
  });

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            decoration: BoxDecoration(
              color: colors.accent,
              borderRadius: BorderRadius.circular(999),
            ),
            child: Text(badgeLabel,
                style: const TextStyle(fontWeight: FontWeight.bold)),
          ),
          const SizedBox(height: 12),
          Text(title, style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(
            subtitle,
            style: const TextStyle(color: Colors.black54),
          ),
          const SizedBox(height: 24),
          Wrap(
            spacing: 20,
            runSpacing: 20,
            children: items.map((item) {
              return SizedBox(
                width: 260,
                child: Card(
                  elevation: 2,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        height: 160,
                        decoration: BoxDecoration(
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                          gradient: const LinearGradient(
                            colors: [Color(0xFFFFF0C1), Color(0xFFE3F6CC)],
                          ),
                        ),
                        child: const Center(
                          child: Icon(Icons.local_dining, size: 40, color: Colors.black54),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: colors.accent,
                                borderRadius: BorderRadius.circular(999),
                              ),
                              child: Text(
                                lang.t('home.popular'),
                                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(item.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                            const SizedBox(height: 6),
                            Text(
                              item.subtitle ?? '',
                              style: const TextStyle(color: Colors.black54, fontSize: 12),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 10),
                            Text(
                              '\$${item.price.toStringAsFixed(2)}',
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 8),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: colors.primary,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                              ),
                              onPressed: () => onOrder(item),
                              child: Text(
                                item.ctaLabel.isNotEmpty
                                    ? lang.translateCtaLabel(item.ctaLabel)
                                    : lang.t('home.order'),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

class _CombosBand extends StatelessWidget {
  final List<RestaurantWebsiteFeaturedItem> items;
  final BrandingColors colors;
  final ValueChanged<RestaurantWebsiteFeaturedItem> onOrder;

  const _CombosBand({
    required this.items,
    required this.colors,
    required this.onOrder,
  });

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final visible = items.take(4).toList();
    final remaining = items.length > 4 ? items.sublist(4) : const <RestaurantWebsiteFeaturedItem>[];
    final pages = _chunk(remaining, 4);

    return Container(
      width: double.infinity,
      color: colors.primary,
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
      child: Column(
        children: [
          Text(
            lang.t('home.combosTitle'),
            style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            lang.t('home.combosSubtitle'),
            style: const TextStyle(color: Colors.white70, fontSize: 16),
          ),
          const SizedBox(height: 24),
          _CombosGrid(
            items: visible,
            colors: colors,
            onOrder: onOrder,
          ),
          if (pages.isNotEmpty) ...[
            const SizedBox(height: 24),
            SizedBox(
              height: 260,
              child: PageView.builder(
                itemCount: pages.length,
                controller: PageController(viewportFraction: 0.95),
                itemBuilder: (context, index) {
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    child: _CombosGrid(
                      items: pages[index],
                      colors: colors,
                      onOrder: onOrder,
                    ),
                  );
                },
              ),
            ),
          ],
        ],
      ),
    );
  }

  List<List<RestaurantWebsiteFeaturedItem>> _chunk(
    List<RestaurantWebsiteFeaturedItem> list,
    int size,
  ) {
    if (list.isEmpty) return const [];
    final chunks = <List<RestaurantWebsiteFeaturedItem>>[];
    for (var i = 0; i < list.length; i += size) {
      chunks.add(list.sublist(i, i + size > list.length ? list.length : i + size));
    }
    return chunks;
  }
}

class _CombosGrid extends StatelessWidget {
  final List<RestaurantWebsiteFeaturedItem> items;
  final BrandingColors colors;
  final ValueChanged<RestaurantWebsiteFeaturedItem> onOrder;

  const _CombosGrid({
    required this.items,
    required this.colors,
    required this.onOrder,
  });

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    return LayoutBuilder(
      builder: (context, constraints) {
        final isNarrow = constraints.maxWidth < 900;
        final maxWidth = constraints.maxWidth;
        final cardWidth = isNarrow
            ? 240.0
            : ((maxWidth - (items.length - 1) * 20) / items.length)
                .clamp(200.0, 260.0);

        if (isNarrow) {
          return SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: items.map((item) {
                return Padding(
                  padding: const EdgeInsets.only(right: 16),
                  child: _ComboCard(
                    item: item,
                    colors: colors,
                    onOrder: onOrder,
                    width: cardWidth,
                  ),
                );
              }).toList(),
            ),
          );
        }

        return Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: items.map((item) {
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10),
              child: _ComboCard(
                item: item,
                colors: colors,
                onOrder: onOrder,
                width: cardWidth,
              ),
            );
          }).toList(),
        );
      },
    );
  }
}

class _ComboCard extends StatelessWidget {
  final RestaurantWebsiteFeaturedItem item;
  final BrandingColors colors;
  final ValueChanged<RestaurantWebsiteFeaturedItem> onOrder;
  final double width;

  const _ComboCard({
    required this.item,
    required this.colors,
    required this.onOrder,
    required this.width,
  });

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    return Container(
      width: width,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: const [
          BoxShadow(color: Colors.black26, blurRadius: 12, offset: Offset(0, 6)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 150,
            decoration: BoxDecoration(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
              gradient: const LinearGradient(
                colors: [Color(0xFFFFF0C1), Color(0xFFE3F6CC)],
              ),
            ),
            child: const Center(
              child: Icon(Icons.local_dining, size: 40, color: Colors.black54),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                Text(
                  item.subtitle ?? '',
                  style: const TextStyle(color: Colors.black54, fontSize: 12),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 10),
                Text(
                  '\$${item.price.toStringAsFixed(2)}',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 10),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: colors.primary,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  ),
                  onPressed: () => onOrder(item),
                  child: Text(
                    item.ctaLabel.isNotEmpty
                        ? lang.translateCtaLabel(item.ctaLabel)
                        : lang.t('home.order'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ReviewsSection extends StatelessWidget {
  final List<RestaurantWebsiteReview> reviews;
  final BrandingColors colors;

  const _ReviewsSection({required this.reviews, required this.colors});

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32),
      child: Column(
        children: [
          Text(lang.t('home.reviewsTitle'),
              style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
          const SizedBox(height: 24),
          Wrap(
            spacing: 20,
            runSpacing: 20,
            children: reviews.map((review) {
              return SizedBox(
                width: 280,
                child: Card(
                  elevation: 1,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: List.generate(
                            review.rating,
                            (_) => Icon(Icons.star, color: colors.accent, size: 16),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(review.quote, style: const TextStyle(color: Colors.black87)),
                        const SizedBox(height: 12),
                        Text(review.author, style: const TextStyle(fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

class _FinalCta extends StatelessWidget {
  final String slug;
  final BrandingColors colors;
  const _FinalCta({required this.slug, required this.colors});

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    return Container(
      width: double.infinity,
      color: colors.secondary,
      padding: const EdgeInsets.symmetric(vertical: 48),
      child: Column(
        children: [
          Text(
            lang.t('home.finalCtaTitle'),
            style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          Text(
            lang.t('home.finalCtaSubtitle'),
            style: const TextStyle(color: Colors.white70),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            alignment: WrapAlignment.center,
            children: [
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: colors.primary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                ),
                onPressed: () => Navigator.of(context).pushNamed('/r/$slug/order?mode=pickup'),
                child: Text(lang.t('home.orderPickup')),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: colors.accent,
                  foregroundColor: Colors.black,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                ),
                onPressed: () => Navigator.of(context).pushNamed('/r/$slug/order?mode=delivery'),
                child: Text(lang.t('home.orderDelivery')),
              ),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: colors.secondary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                ),
                onPressed: () => Navigator.of(context).pushNamed('/r/$slug/menu'),
                icon: const Icon(Icons.menu_book),
                label: Text(lang.t('home.menuButton')),
              ),
            ],
          ),
        ],
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
