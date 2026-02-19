import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../data/state/cart_store.dart';
import '../../../data/state/tenant_menu_provider.dart';
import '../../../data/models/menu_models.dart';
import '../../../data/models/restaurant_website_payload.dart';
import '../../../data/state/language_provider.dart';
import '../../menu/menu_api_service.dart';
import '../branding.dart';
import '../widgets/storefront_shell.dart';

class MenuPage extends StatefulWidget {
  final String slug;
  const MenuPage({super.key, required this.slug});

  @override
  State<MenuPage> createState() => _MenuPageState();
}

class _MenuPageState extends State<MenuPage> {
  String selectedCategoryId = 'all';
  String query = '';
  bool _initializedFromQuery = false;
  String? featuredKey;
  bool featuredLoading = false;
  List<RestaurantWebsiteFeaturedItem> featuredItems = [];

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      final provider = context.read<TenantMenuProvider>();
      provider.load(widget.slug);
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_initializedFromQuery) return;
    final routeName = ModalRoute.of(context)?.settings.name;
    if (routeName == null) {
      _initializedFromQuery = true;
      return;
    }
    final uri = Uri.tryParse(routeName);
    final categoryId = uri?.queryParameters['categoryId'];
    if (categoryId != null && categoryId.isNotEmpty) {
      selectedCategoryId = categoryId;
    }
    final featured = uri?.queryParameters['featured'];
    if (featured != null && featured.isNotEmpty && featured != featuredKey) {
      featuredKey = featured;
      _loadFeatured();
    }
    _initializedFromQuery = true;
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartStore>();
    final menuProvider = context.watch<TenantMenuProvider>();
    final lang = context.watch<LanguageProvider>();

    if (menuProvider.loading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (menuProvider.error != null) {
      return _ErrorState(
        message: menuProvider.error!,
        onRetry: () => menuProvider.load(widget.slug),
      );
    }

    final restaurant = menuProvider.restaurant;
    final categories = menuProvider.categories;
    final items = menuProvider.items;
    final colors = BrandingColors.fromRestaurant(restaurant);
    final categoryById = {
      for (final c in categories) c.id: c,
    };
    final screenWidth = MediaQuery.of(context).size.width;
    final isNarrowScreen = screenWidth < 480;

    final filtered = items.where((item) {
      final byCat = selectedCategoryId == 'all' || item.categoryId == selectedCategoryId;
      final byQ = query.isEmpty ||
          item.name.toLowerCase().contains(query.toLowerCase()) ||
          item.description.toLowerCase().contains(query.toLowerCase());
      return byCat && byQ;
    }).toList();

    return StorefrontShell(
      restaurant: restaurant,
      slug: widget.slug,
      activeTab: 'menu',
      cartQty: cart.totalQty,
      showFooter: false,
      child: SingleChildScrollView(
        child: Padding(
          padding: EdgeInsets.symmetric(
            horizontal: isNarrowScreen ? 12 : 24,
            vertical: 24,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextField(
                decoration: InputDecoration(
                  hintText: lang.t('menu.searchHint'),
                  prefixIcon: const Icon(Icons.search),
                  filled: true,
                  fillColor: colors.surface,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: BorderSide(color: Colors.grey.shade300),
                  ),
                ),
                onChanged: (value) => setState(() => query = value.trim()),
              ),
              const SizedBox(height: 16),
              if (menuProvider.menuUnavailable)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: colors.accent.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: colors.accent),
                  ),
                  child: Text(
                    lang.t('menu.unavailable'),
                    style: TextStyle(color: colors.primary, fontWeight: FontWeight.w600),
                  ),
                ),
              if (menuProvider.menuUnavailable) const SizedBox(height: 16),
              _CategoryChips(
                categories: categories,
                selectedId: selectedCategoryId,
                colors: colors,
                onSelect: (id) => setState(() => selectedCategoryId = id),
              ),
              const SizedBox(height: 20),
              Text(
                _titleForCategory(categories, selectedCategoryId),
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              if (featuredKey != null) ...[
                const SizedBox(height: 8),
                Text(
                  featuredKey == 'daily'
                      ? lang.t('home.dailySpecials')
                      : featuredKey == 'combos'
                          ? lang.t('home.combosTitle')
                          : lang.t('home.houseFavorites'),
                  style: TextStyle(color: colors.primary, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 12),
                if (featuredLoading)
                  const Center(child: CircularProgressIndicator())
                else if (featuredItems.isEmpty)
                  Text(lang.t('menu.noItems'))
                else
                  _FeaturedPicker(
                    items: featuredItems,
                    colors: colors,
                    onAdd: (item) => _addFeaturedToCart(
                      context,
                      item,
                      items,
                      cart,
                      widget.slug,
                    ),
                  ),
                const SizedBox(height: 20),
              ],
              const SizedBox(height: 6),
              Text(
                lang.t('menu.subtitleAll'),
                style: const TextStyle(color: Colors.black54),
              ),
              if (selectedCategoryId != 'all')
                Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Text(
                    categoryById[selectedCategoryId]?.description ?? '',
                    style: const TextStyle(color: Colors.black54),
                  ),
                ),
              const SizedBox(height: 20),
              if (filtered.isEmpty)
                Center(
                  child: Column(
                    children: [
                      const Icon(Icons.inventory_2_outlined, size: 48, color: Colors.black38),
                      const SizedBox(height: 8),
                      Text(lang.t('menu.noItems'),
                          style: const TextStyle(color: Colors.black54)),
                    ],
                  ),
                ),
              if (filtered.isNotEmpty)
                LayoutBuilder(
                  builder: (context, constraints) {
                    final maxWidth = constraints.maxWidth;
                    final isNarrow = maxWidth < 520;
                    final cardWidth = isNarrow
                        ? maxWidth
                        : maxWidth >= 1200
                            ? 280.0
                            : maxWidth >= 900
                                ? 260.0
                                : 220.0;
                    return Wrap(
                      alignment: WrapAlignment.center,
                      spacing: isNarrow ? 0 : 16,
                      runSpacing: 16,
                      children: filtered.map((item) {
                        final rawCategoryName = categoryById[item.categoryId]?.name ?? '';
                        final categoryName = lang.translateCategory(rawCategoryName);
                        final canOrder = item.isAvailable && item.isActive;
                        return SizedBox(
                          width: cardWidth,
                          child: _MenuItemCard(
                            item: item,
                            categoryName: categoryName,
                            colors: colors,
                            canOrder: canOrder,
                            onAdd: () {
                              context.read<CartStore>().addMenuItem(item);
                              ScaffoldMessenger.of(context).hideCurrentSnackBar();
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    lang.t('menu.addedToCart', vars: {'item': item.name}),
                                  ),
                                  action: SnackBarAction(
                                    label: lang.t('menu.viewCart'),
                                    onPressed: () =>
                                        Navigator.of(context).pushNamed('/r/${widget.slug}/cart'),
                                  ),
                                ),
                              );
                            },
                          ),
                        );
                      }).toList(),
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }

  String _titleForCategory(List categories, String selectedId) {
    if (selectedId == 'all') return context.read<LanguageProvider>().t('menu.titleAll');
    final match = categories.where((c) => c.id == selectedId).toList();
    if (match.isEmpty) return context.read<LanguageProvider>().t('menu.titleAll');
    return context.read<LanguageProvider>().translateCategory(match.first.name);
  }

  Future<void> _loadFeatured() async {
    if (featuredKey == null) return;
    setState(() => featuredLoading = true);
    try {
      final api = MenuApiService();
      final data = await api.getPublicFeatured(widget.slug);
      final sections = data?['sections'];
      if (sections is List) {
        for (final section in sections.whereType<Map<String, dynamic>>()) {
          if (section['key']?.toString() != featuredKey) continue;
          final itemsRaw = section['items'];
          if (itemsRaw is List) {
            featuredItems = itemsRaw
                .whereType<Map<String, dynamic>>()
                .map((item) => RestaurantWebsiteFeaturedItem(
                      id: item['id']?.toString() ?? '',
                      type: item['type']?.toString() ?? 'menu_item',
                      title: item['title']?.toString() ?? '',
                      subtitle: item['subtitle']?.toString(),
                      price: _parsePrice(item['price']),
                      imageUrl: item['imageUrl']?.toString(),
                      ctaLabel: item['ctaLabel']?.toString() ?? '',
                      requiresConfiguration: item['requiresConfiguration'] == true,
                    ))
                .where((item) => item.id.isNotEmpty && item.title.isNotEmpty)
                .toList();
          }
        }
      }
    } catch (_) {
      featuredItems = [];
    } finally {
      if (mounted) setState(() => featuredLoading = false);
    }
  }

  void _addFeaturedToCart(
    BuildContext context,
    RestaurantWebsiteFeaturedItem item,
    List<MenuItemModel> items,
    CartStore cart,
    String slug,
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

    final matched = items.firstWhere(
      (menuItem) => menuItem.id == item.id,
      orElse: () => MenuItemModel(
        id: item.id,
        categoryId: '',
        name: item.title,
        description: item.subtitle ?? '',
        price: item.price,
        imageUrl: item.imageUrl ?? '',
        isAvailable: true,
        isActive: true,
        tags: const [],
        allergens: const [],
        preparationTime: null,
      ),
    );

    cart.addMenuItem(matched);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(lang.t('menu.addedToCart', vars: {'item': item.title}))),
    );
  }

  double _parsePrice(dynamic value) {
    if (value is num) return value.toDouble();
    return double.tryParse(value?.toString() ?? '') ?? 0.0;
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
        constraints: const BoxConstraints(maxWidth: 420),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.wifi_off, size: 48, color: Colors.black54),
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

class _FeaturedPicker extends StatelessWidget {
  final List<RestaurantWebsiteFeaturedItem> items;
  final BrandingColors colors;
  final ValueChanged<RestaurantWebsiteFeaturedItem> onAdd;

  const _FeaturedPicker({
    required this.items,
    required this.colors,
    required this.onAdd,
  });

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    return Wrap(
      spacing: 16,
      runSpacing: 16,
      children: items.map((item) {
        return SizedBox(
          width: 240,
          child: Card(
            elevation: 1,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  Text(
                    item.subtitle ?? '',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: Colors.black54, fontSize: 12),
                  ),
                  const SizedBox(height: 8),
                  Text('\$${item.price.toStringAsFixed(2)}'),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: colors.primary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    ),
                    onPressed: () => onAdd(item),
                    child: Text(
                      item.ctaLabel.isNotEmpty
                          ? lang.translateCtaLabel(item.ctaLabel)
                          : lang.t('home.order'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}

class _CategoryChips extends StatelessWidget {
  final List<MenuCategory> categories;
  final String selectedId;
  final BrandingColors colors;
  final ValueChanged<String> onSelect;

  const _CategoryChips({
    required this.categories,
    required this.selectedId,
    required this.colors,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 44,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          _Chip(
            label: context.watch<LanguageProvider>().t('menu.categoryAll'),
            active: selectedId == 'all',
            colors: colors,
            onTap: () => onSelect('all'),
          ),
          ...categories.map(
            (c) => _Chip(
              label: context.watch<LanguageProvider>().translateCategory(c.name),
              active: selectedId == c.id,
              colors: colors,
              onTap: () => onSelect(c.id),
            ),
          ),
        ],
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  final String label;
  final bool active;
  final BrandingColors colors;
  final VoidCallback onTap;

  const _Chip({
    required this.label,
    required this.active,
    required this.colors,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            color: active ? colors.primary : colors.surface,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: active ? colors.primary : Colors.grey.shade200),
          ),
          child: Text(
            label,
            style: TextStyle(
              color: active ? Colors.white : Colors.black87,
              fontWeight: active ? FontWeight.w600 : FontWeight.normal,
            ),
          ),
        ),
      ),
    );
  }
}

class _MenuItemCard extends StatelessWidget {
  final MenuItemModel item;
  final String categoryName;
  final BrandingColors colors;
  final bool canOrder;
  final VoidCallback onAdd;

  const _MenuItemCard({
    required this.item,
    required this.categoryName,
    required this.colors,
    required this.canOrder,
    required this.onAdd,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      color: colors.surface,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _MenuImage(imageUrl: item.imageUrl),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (categoryName.isNotEmpty)
                  Text(
                    categoryName,
                    style: const TextStyle(fontSize: 11, color: Colors.black54),
                  ),
                const SizedBox(height: 4),
                Text(
                  item.name,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  item.description.isEmpty
                      ? context.watch<LanguageProvider>().t('menu.noDescription')
                      : item.description,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: Colors.black54, fontSize: 12),
                ),
                if (item.tags.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: item.tags
                        .take(3)
                        .map(
                          (tag) => Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: colors.accent.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              tag,
                              style: TextStyle(
                                fontSize: 10,
                                color: colors.primary,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        )
                        .toList(),
                  ),
                ],
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '\$${item.price.toStringAsFixed(2)}',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    if (!canOrder)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade200,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Text(
                          context.watch<LanguageProvider>().t('menu.soldOut'),
                          style: const TextStyle(fontSize: 12, color: Colors.black54),
                        ),
                      )
                    else
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: colors.primary,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                        ),
                        onPressed: onAdd,
                        child: Text(context.watch<LanguageProvider>().t('menu.add')),
                      ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MenuImage extends StatelessWidget {
  final String imageUrl;

  const _MenuImage({required this.imageUrl});

  @override
  Widget build(BuildContext context) {
    final hasImage = imageUrl.isNotEmpty;
    return ClipRRect(
      borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
      child: Container(
        height: 150,
        width: double.infinity,
        color: const Color(0xFFF2F2F2),
        child: hasImage
            ? Image.network(
                imageUrl,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => const Center(
                  child: Icon(Icons.local_dining, size: 36, color: Colors.black54),
                ),
              )
            : const Center(
                child: Icon(Icons.local_dining, size: 36, color: Colors.black54),
              ),
      ),
    );
  }
}
