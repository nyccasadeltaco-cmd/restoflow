import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../data/models/menu_models.dart';
import '../../../data/state/language_provider.dart';

class MenuItemCard extends StatelessWidget {
  final MenuItemModel item;
  final VoidCallback onAdd;

  const MenuItemCard({super.key, required this.item, required this.onAdd});

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final canOrder = item.isAvailable && item.isActive;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Container(
              width: 92,
              height: 92,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                color: Colors.black12,
              ),
              child: item.imageUrl.isNotEmpty
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.network(
                        item.imageUrl,
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
                  Text(item.name, style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 6),
                  Text(
                    item.description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context)
                        .textTheme
                        .bodyMedium
                        ?.copyWith(color: Colors.black54),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    '\$${item.price.toStringAsFixed(2)}',
                    style: Theme.of(context).textTheme.titleSmall,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            if (!canOrder)
              Text(lang.t('menu.soldOut'), style: const TextStyle(color: Colors.black54))
            else
              FilledButton(
                onPressed: onAdd,
                child: Text(lang.t('menu.add')),
              ),
          ],
        ),
      ),
    );
  }
}
