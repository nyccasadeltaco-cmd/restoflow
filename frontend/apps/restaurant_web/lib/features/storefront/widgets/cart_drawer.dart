import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../data/state/language_provider.dart';

class CartDrawer extends StatelessWidget {
  final List<Map<String, dynamic>> items;
  final double subtotal;
  final double deliveryFee;
  final double total;
  final VoidCallback onCheckout;

  const CartDrawer({
    super.key,
    required this.items,
    required this.subtotal,
    required this.deliveryFee,
    required this.total,
    required this.onCheckout,
  });

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();

    return Drawer(
      child: Column(
        children: [
          DrawerHeader(child: Text(lang.t('cart.title'))),
          Expanded(
            child: ListView.builder(
              itemCount: items.length,
              itemBuilder: (_, i) {
                final item = items[i];
                return ListTile(
                  title: Text(item['name'] ?? ''),
                  subtitle: Text('x${item['qty']}'),
                  trailing: Text('\$${item['price']?.toStringAsFixed(2) ?? ''}'),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text('${lang.t('cart.subtotal')}: \$${subtotal.toStringAsFixed(2)}'),
                Text('${lang.t('cart.delivery')}: \$${deliveryFee.toStringAsFixed(2)}'),
                Text(
                  'Total: \$${total.toStringAsFixed(2)}',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                ElevatedButton(
                  onPressed: onCheckout,
                  child: Text(lang.t('cart.checkout')),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
