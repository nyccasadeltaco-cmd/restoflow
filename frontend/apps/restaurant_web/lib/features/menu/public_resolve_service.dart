import 'dart:convert';
import 'package:http/http.dart' as http;

const String _apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'https://api.restoflow.tech/api',
);

const String _defaultSlug = String.fromEnvironment(
  'DEFAULT_SLUG',
  defaultValue: 'casadeltaconyc',
);

class PublicResolveService {
  static Future<String> resolveInitialSlug() async {
    final base = Uri.base;
    final host = _normalizeHost(base.host);
    final pathSlug = _slugFromPath(base);

    final query = <String, String>{};
    if (_isResolvableHost(host)) {
      query['host'] = host;
    } else if (pathSlug != null) {
      query['slug'] = pathSlug;
    } else {
      query['slug'] = _defaultSlug;
    }

    final uri = Uri.parse('$_apiBaseUrl/public/resolve')
        .replace(queryParameters: query);

    try {
      final response = await http.get(uri).timeout(const Duration(seconds: 5));
      if (response.statusCode != 200) {
        return pathSlug ?? _defaultSlug;
      }

      final body = json.decode(response.body);
      if (body is! Map<String, dynamic>) {
        return pathSlug ?? _defaultSlug;
      }

      final restaurant = body['restaurant'];
      if (restaurant is Map<String, dynamic>) {
        final slug = restaurant['slug']?.toString().trim();
        if (slug != null && slug.isNotEmpty) {
          return slug;
        }
      }

      final tenant = body['tenant'];
      if (tenant is Map<String, dynamic>) {
        final slug = tenant['slug']?.toString().trim();
        if (slug != null && slug.isNotEmpty) {
          return slug;
        }
      }
    } catch (_) {
      // Ignore network errors here and use deterministic fallback.
    }

    return pathSlug ?? _defaultSlug;
  }

  static String _normalizeHost(String host) {
    final normalized = host.trim().toLowerCase();
    if (normalized.startsWith('www.')) {
      return normalized.substring(4);
    }
    return normalized;
  }

  static bool _isResolvableHost(String host) {
    return host.isNotEmpty && host != 'localhost' && host != '127.0.0.1';
  }

  static String? _slugFromPath(Uri uri) {
    final segments = uri.pathSegments;
    if (segments.length >= 2 && segments[0] == 'r') {
      final slug = segments[1].trim().toLowerCase();
      if (slug.isNotEmpty) return slug;
    }
    return null;
  }
}
