import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../data/state/tenant_menu_provider.dart';
import '../../data/state/cart_store.dart';
import '../../data/state/language_provider.dart';
import 'widgets/category_chips.dart';
import 'widgets/menu_item_card.dart';
import '../cart/cart_drawer.dart';

class MenuTodoPage extends StatefulWidget {
  final String slug;
  const MenuTodoPage({super.key, required this.slug});

  @override
  State<MenuTodoPage> createState() => _MenuTodoPageState();
}

class _MenuTodoPageState extends State<MenuTodoPage> {
  String selectedCategoryId = 'all';
  String q = '';

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      final provider = context.read<TenantMenuProvider>();
      provider.load(widget.slug);
    });
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
    final branding = menuProvider.branding;
    final categories = menuProvider.categories;
    final items = menuProvider.items;

    final filtered = items.where((item) {
      final byCat = selectedCategoryId == 'all' || item.categoryId == selectedCategoryId;
      final byQ = q.trim().isEmpty ||
          item.name.toLowerCase().contains(q.toLowerCase()) ||
          item.description.toLowerCase().contains(q.toLowerCase());
      return byCat && byQ;
    }).toList();

    return Scaffold(
      endDrawer: const CartDrawer(),
      appBar: AppBar(
        title: Text(branding?.name ?? lang.t('common.restaurant')),
        actions: [
          IconButton(
            tooltip: lang.t('cart.title'),
            onPressed: () => Scaffold.of(context).openEndDrawer(),
            icon: Stack(
              alignment: Alignment.topRight,
              children: [
                const Icon(Icons.shopping_bag_outlined),
                if (cart.totalQty > 0)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(999),
                      color: Colors.red,
                    ),
                    child: Text(
                      '${cart.totalQty}',
                      style: const TextStyle(color: Colors.white, fontSize: 12),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1100),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    branding?.tagline ?? '',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.black54),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        decoration: InputDecoration(
                          prefixIcon: const Icon(Icons.search),
                          hintText: lang.t('menu.searchHint'),
                          border: const OutlineInputBorder(),
                        ),
                        onChanged: (v) => setState(() => q = v),
                      ),
                    ),
                    const SizedBox(width: 12),
                    FilledButton(
                      onPressed: () => Scaffold.of(context).openEndDrawer(),
                      child: Text(lang.t('menu.viewCart')),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                CategoryChips(
                  categories: categories,
                  selectedId: selectedCategoryId,
                  onSelect: (id) => setState(() => selectedCategoryId = id),
                ),
                const SizedBox(height: 12),
                Expanded(
                  child: ListView.builder(
                    itemCount: filtered.length,
                    itemBuilder: (_, i) {
                      final item = filtered[i];
                      return MenuItemCard(
                        item: item,
                        onAdd: () => context.read<CartStore>().add(item),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
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
