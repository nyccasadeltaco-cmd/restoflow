import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../data/state/cart_store.dart';
import '../../data/state/language_provider.dart';
import '../../data/models/menu_models.dart';

class CartDrawer extends StatelessWidget {
  const CartDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartStore>();
    final lang = context.watch<LanguageProvider>();

    return Drawer(
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Row(
                children: [
                  Text(lang.t('cart.title'), style: Theme.of(context).textTheme.titleLarge),
                  const Spacer(),
                  IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.close)),
                ],
              ),
              const SizedBox(height: 12),
              Expanded(
                child: cart.lines.isEmpty
                    ? Center(child: Text(lang.t('cart.empty')))
                    : ListView.builder(
                        itemCount: cart.lines.length,
                        itemBuilder: (_, i) {
                          final line = cart.lines[i];
                          return ListTile(
                            title: Text(line.name),
                            subtitle: Text('\$${line.price.toStringAsFixed(2)}'),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  onPressed: () => cart.removeOne(line.type, line.id),
                                  icon: const Icon(Icons.remove),
                                ),
                                Text('${line.qty}'),
                                IconButton(
                                  onPressed: () {
                                    if (line.type == CartItemType.combo) {
                                      cart.addCombo(
                                        id: line.id,
                                        name: line.name,
                                        description: line.description,
                                        price: line.price,
                                        imageUrl: line.imageUrl,
                                      );
                                    } else {
                                      cart.addMenuItem(MenuItemModel(
                                        id: line.id,
                                        categoryId: '',
                                        name: line.name,
                                        description: line.description,
                                        price: line.price,
                                        imageUrl: line.imageUrl,
                                        isAvailable: true,
                                        isActive: true,
                                        tags: const [],
                                        allergens: const [],
                                        preparationTime: null,
                                      ));
                                    }
                                  },
                                  icon: const Icon(Icons.add),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Text(lang.t('cart.subtotal')),
                  const Spacer(),
                  Text('\$${cart.subtotal.toStringAsFixed(2)}'),
                ],
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: cart.lines.isEmpty ? null : () {},
                  child: Text(lang.t('cart.checkout')),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
