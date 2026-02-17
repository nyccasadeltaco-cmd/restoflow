import 'package:flutter/material.dart';
import '../models/menu_models.dart';
import '../../features/menu/menu_api_service.dart';

class TenantMenuProvider extends ChangeNotifier {
  TenantBranding? branding;
  RestaurantInfo? restaurant;
  List<MenuCategory> categories = [];
  List<MenuItemModel> items = [];
  bool loading = false;
  bool menuUnavailable = false;
  String? error;
  bool isNetworkError = false;

  Future<void> load(String slug) async {
    loading = true;
    error = null;
    menuUnavailable = false;
    isNetworkError = false;
    notifyListeners();
    try {
      final api = MenuApiService();
      final restaurantInfo = await api.getPublicRestaurant(slug);
      final menu = await api.getPublicMenu(slug);
      if (restaurantInfo == null || menu == null) {
        if (restaurantInfo == null) {
          error = 'No se encontro el restaurante.';
          loading = false;
          notifyListeners();
          return;
        }
        restaurant = restaurantInfo;
        branding = TenantBranding(
          slug: restaurantInfo.slug,
          name: restaurantInfo.name,
          tagline: '',
        );
        menuUnavailable = true;
        categories = [];
        items = [];
        loading = false;
        notifyListeners();
        return;
      }
      restaurant = restaurantInfo;
      branding = TenantBranding(
        slug: restaurantInfo.slug,
        name: restaurantInfo.name,
        tagline: '',
      );
      menuUnavailable = false;
      categories = (menu['categories'] as List)
          .map(
            (c) => MenuCategory(
              id: c['id'],
              name: c['name'],
              description: c['description'] ?? '',
              imageUrl: c['imageUrl'] ?? '',
            ),
          )
          .toList();
      items = (menu['items'] as List)
          .map((i) => MenuItemModel(
                id: i['id'],
                categoryId: i['categoryId'],
                name: i['name'],
                description: i['description'] ?? '',
                price: _parsePrice(i['price']),
                imageUrl: i['imageUrl'] ?? '',
                isAvailable: i['isAvailable'] ?? true,
                isActive: i['isActive'] ?? true,
                tags: (i['tags'] as List?)?.map((t) => t.toString()).toList() ?? const [],
                allergens:
                    (i['allergens'] as List?)?.map((a) => a.toString()).toList() ??
                        const [],
                preparationTime: i['preparationTime'] is num
                    ? (i['preparationTime'] as num).toInt()
                    : int.tryParse('${i['preparationTime']}'),
              ))
          .toList();
      loading = false;
      notifyListeners();
    } catch (e) {
      isNetworkError = _isNetworkError(e);
      error = isNetworkError
          ? 'No se pudo conectar al servidor. Intenta de nuevo.'
          : 'Ocurrio un error al cargar el menu.';
      loading = false;
      notifyListeners();
    }
  }

  double _parsePrice(dynamic value) {
    if (value == null) return 0.0;
    if (value is num) return value.toDouble();
    final parsed = double.tryParse(value.toString());
    return parsed ?? 0.0;
  }

  bool _isNetworkError(Object error) {
    final text = error.toString();
    return text.contains('ClientException') ||
        text.contains('Failed to fetch') ||
        text.contains('SocketException');
  }
}
