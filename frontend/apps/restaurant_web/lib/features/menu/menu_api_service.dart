import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../data/models/menu_models.dart';

const String _apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'https://api.restoflow.tech/api',
);

class MenuApiService {
  /// Obtiene datos del restaurante publico
  Future<RestaurantInfo?> getPublicRestaurant(String slug) async {
    final url = Uri.parse('$_apiBaseUrl/public/restaurants/$slug');
    final resp = await http.get(url);
    if (resp.statusCode == 200) {
      final data = json.decode(resp.body);
      return RestaurantInfo.fromJson(data as Map<String, dynamic>);
    }
    return null;
  }

  /// Obtiene menu publico completo (categorias + items)
  Future<Map<String, dynamic>?> getPublicMenu(String slug) async {
    final url = Uri.parse(
      '$_apiBaseUrl/public/restaurants/$slug/menu?includeUnavailable=1',
    );
    final resp = await http.get(url);
    if (resp.statusCode == 200) {
      return json.decode(resp.body) as Map<String, dynamic>;
    }
    return null;
  }

  /// Obtiene secciones destacadas para home
  Future<Map<String, dynamic>?> getPublicFeatured(String slug) async {
    final url = Uri.parse('$_apiBaseUrl/public/restaurants/$slug/featured');
    final resp = await http.get(url);
    if (resp.statusCode == 200) {
      return json.decode(resp.body) as Map<String, dynamic>;
    }
    return null;
  }

  /// Crea una orden publica
  Future<Map<String, dynamic>?> createPublicOrder(
    String slug,
    Map<String, dynamic> order,
  ) async {
    final url = Uri.parse('$_apiBaseUrl/public/orders');
    final payload = {
      ...order,
      'restaurantSlug': slug,
    };
    final resp = await http.post(
      url,
      body: json.encode(payload),
      headers: {'Content-Type': 'application/json'},
    );
    if (resp.statusCode == 200 || resp.statusCode == 201) {
      return json.decode(resp.body) as Map<String, dynamic>;
    }
    throw Exception(
      'Public order failed (${resp.statusCode}): ${resp.body}',
    );
  }

  /// Crea una sesion de Stripe Checkout
  Future<Map<String, dynamic>?> createCheckoutSession(
    String slug,
    Map<String, dynamic> payload,
  ) async {
    final url = Uri.parse('$_apiBaseUrl/public/stripe/checkout-session');
    final body = {
      ...payload,
      'restaurantSlug': slug,
    };
    final resp = await http.post(
      url,
      body: json.encode(body),
      headers: {'Content-Type': 'application/json'},
    );
    if (resp.statusCode == 200 || resp.statusCode == 201) {
      return json.decode(resp.body) as Map<String, dynamic>;
    }
    return null;
  }
}
