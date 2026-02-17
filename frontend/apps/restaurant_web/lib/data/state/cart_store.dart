import 'package:flutter/foundation.dart';
import '../models/menu_models.dart';

enum CartItemType { menuItem, combo }

class CartLine {
  final CartItemType type;
  final String id;
  final String name;
  final String description;
  final double price;
  final String imageUrl;
  int qty;

  CartLine({
    required this.type,
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.imageUrl,
    required this.qty,
  });
}

class CartStore extends ChangeNotifier {
  final Map<String, CartLine> _lines = {};

  List<CartLine> get lines => _lines.values.toList();

  int get totalQty => _lines.values.fold(0, (a, b) => a + b.qty);

  double get subtotal => _lines.values.fold(0.0, (a, b) => a + (b.price * b.qty));

  void addMenuItem(MenuItemModel item) {
    _addLine(
      CartLine(
        type: CartItemType.menuItem,
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl,
        qty: 1,
      ),
    );
  }

  void addCombo({
    required String id,
    required String name,
    String? description,
    required double price,
    String? imageUrl,
  }) {
    _addLine(
      CartLine(
        type: CartItemType.combo,
        id: id,
        name: name,
        description: description ?? '',
        price: price,
        imageUrl: imageUrl ?? '',
        qty: 1,
      ),
    );
  }

  void _addLine(CartLine line) {
    final key = _keyFor(line.type, line.id);
    final existing = _lines[key];
    if (existing == null) {
      _lines[key] = line;
    } else {
      existing.qty += 1;
    }
    notifyListeners();
  }

  void removeOne(CartItemType type, String id) {
    final key = _keyFor(type, id);
    final existing = _lines[key];
    if (existing == null) return;
    existing.qty -= 1;
    if (existing.qty <= 0) _lines.remove(key);
    notifyListeners();
  }

  void clear() {
    _lines.clear();
    notifyListeners();
  }

  String _keyFor(CartItemType type, String id) {
    return '${type.name}:$id';
  }
}
