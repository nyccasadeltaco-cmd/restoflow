import 'package:flutter/material.dart';
import '../models/restaurant_website_payload.dart';
import '../mock/restaurant_website_mock.dart';
import '../../features/menu/menu_api_service.dart';
import '../models/menu_models.dart';

class RestaurantWebsiteProvider extends ChangeNotifier {
  RestaurantWebsitePayload? payload;
  bool loading = false;
  String? error;
  bool isNetworkError = false;

  Future<void> load(String slug) async {
    loading = true;
    error = null;
    isNetworkError = false;
    notifyListeners();

    try {
      final api = MenuApiService();
      final restaurantInfo = await api.getPublicRestaurant(slug);
      if (restaurantInfo == null) {
        payload = null;
        error = 'Restaurant not found';
      } else {
        final menuData = await api.getPublicMenu(slug);
        final featuredData = await api.getPublicFeatured(slug);
        final mock = buildWebsiteMock(slug);
        payload = _buildPayload(
          slug,
          restaurantInfo,
          menuData,
          featuredData,
          mock,
        );
      }
    } catch (e) {
      isNetworkError = _isNetworkError(e);
      error = isNetworkError
          ? 'No se pudo conectar al servidor. Intenta de nuevo.'
          : 'Ocurrio un error al cargar el sitio.';
      payload = null;
    }

    loading = false;
    notifyListeners();
  }

  RestaurantWebsitePayload _buildPayload(
    String slug,
    RestaurantInfo restaurantInfo,
    Map<String, dynamic>? menuData,
    Map<String, dynamic>? featuredData,
    RestaurantWebsitePayload? mock,
  ) {
    final categories = _mapCategories(menuData?['categories']);
    final items = _mapItems(menuData?['items']);
    final hoursByDay = _mapHoursByDay(restaurantInfo.operatingHours) ??
        (mock?.restaurant.hoursByDay ?? const []);
    final hoursText = _buildHoursText(hoursByDay);

    final name = restaurantInfo.name.isNotEmpty ? restaurantInfo.name : (mock?.restaurant.name ?? '');
    final subtitle = _buildSubtitle(restaurantInfo) ?? (mock?.restaurant.subtitle ?? '');
    final address = _buildAddress(restaurantInfo) ?? (mock?.restaurant.address ?? '');
    final phone = restaurantInfo.phone ?? mock?.restaurant.phone ?? '';
    final email = restaurantInfo.email ?? mock?.restaurant.email;
    final logoUrl = restaurantInfo.logoUrl ?? mock?.restaurant.logoUrl ?? '';
    final colors = _mapColors(restaurantInfo, mock?.restaurant.colors);
    final hero = mock?.restaurant.hero ??
        RestaurantWebsiteHero(
          badgeText: '',
          title1: name,
          title2: subtitle.isEmpty ? '' : subtitle,
          description: '',
          bgStyle: 'gradient',
          bgImageUrl: null,
        );
    final etas = mock?.restaurant.etas ??
        const RestaurantWebsiteEtas(
          pickupMin: 15,
          pickupMax: 20,
          deliveryMin: 30,
          deliveryMax: 45,
        );
    final social = mock?.restaurant.social ??
        const RestaurantWebsiteSocial(
          instagram: null,
          tiktok: null,
        );
    final languages = mock?.restaurant.languages ??
        const RestaurantWebsiteLanguages(
          defaultLang: 'es',
          enabled: ['es', 'en'],
        );

    return RestaurantWebsitePayload(
      restaurant: RestaurantWebsiteRestaurant(
        id: restaurantInfo.id,
        slug: slug,
        name: name,
        subtitle: subtitle,
        phone: phone,
        email: email,
        address: address,
        hoursText: hoursText.isNotEmpty ? hoursText : (mock?.restaurant.hoursText ?? ''),
        hoursByDay: hoursByDay,
        logoUrl: logoUrl,
        colors: colors,
        hero: hero,
        etas: etas,
        social: social,
        languages: languages,
      ),
      categories: categories.isNotEmpty ? categories : (mock?.categories ?? const []),
      items: items.isNotEmpty ? items : (mock?.items ?? const []),
      featured: mock?.featured ?? const RestaurantWebsiteFeatured(mostOrderedTag: 'most_ordered', limit: 4),
      featuredSections: _mapFeaturedSections(featuredData?['sections']) ??
          (mock?.featuredSections ?? const []),
      promo: mock?.promo,
      reviews: mock?.reviews ?? const [],
    );
  }

  List<RestaurantWebsiteCategory> _mapCategories(dynamic raw) {
    if (raw is! List) return const [];
    return raw
        .whereType<Map<String, dynamic>>()
        .map((category) => RestaurantWebsiteCategory(
              id: category['id']?.toString() ?? '',
              name: category['name']?.toString() ?? '',
              icon: category['imageUrl']?.toString(),
              displayOrder: _toInt(category['displayOrder']),
            ))
        .where((category) => category.id.isNotEmpty && category.name.isNotEmpty)
        .toList();
  }

  List<RestaurantWebsiteItem> _mapItems(dynamic raw) {
    if (raw is! List) return const [];
    return raw
        .whereType<Map<String, dynamic>>()
        .map((item) {
          final name = item['name']?.toString() ?? '';
          final slug = _slugify(name.isEmpty ? item['id']?.toString() ?? '' : name);
          return RestaurantWebsiteItem(
            id: item['id']?.toString() ?? '',
            categoryId: item['categoryId']?.toString() ?? '',
            name: name,
            slug: slug,
            description: item['description']?.toString(),
            price: _toDouble(item['price']),
            imageUrl: item['imageUrl']?.toString(),
            tags: _toStringList(item['tags']),
            isAvailable: item['isAvailable'] == null ? true : item['isAvailable'] == true,
            displayOrder: _toInt(item['displayOrder']),
          );
        })
        .where((item) => item.id.isNotEmpty && item.name.isNotEmpty)
        .toList();
  }

  List<RestaurantWebsiteFeaturedSection>? _mapFeaturedSections(dynamic raw) {
    if (raw is! List) return null;
    final sections = raw.whereType<Map<String, dynamic>>().map((section) {
      final itemsRaw = section['items'];
      final items = itemsRaw is List
          ? itemsRaw.whereType<Map<String, dynamic>>().map((item) {
              return RestaurantWebsiteFeaturedItem(
                id: item['id']?.toString() ?? '',
                type: item['type']?.toString() ?? 'menu_item',
                title: item['title']?.toString() ?? '',
                subtitle: item['subtitle']?.toString(),
                price: _toDouble(item['price']),
                imageUrl: item['imageUrl']?.toString(),
                ctaLabel: item['ctaLabel']?.toString() ?? '',
                requiresConfiguration: item['requiresConfiguration'] == true,
              );
            }).where((item) => item.id.isNotEmpty && item.title.isNotEmpty).toList()
          : <RestaurantWebsiteFeaturedItem>[];

      return RestaurantWebsiteFeaturedSection(
        key: section['key']?.toString() ?? '',
        title: section['title']?.toString() ?? '',
        items: items,
      );
    }).where((section) => section.key.isNotEmpty && section.items.isNotEmpty).toList();

    return sections.isEmpty ? null : sections;
  }

  RestaurantWebsiteColors _mapColors(
    RestaurantInfo restaurantInfo,
    RestaurantWebsiteColors? fallback,
  ) {
    final branding = restaurantInfo.branding ?? const {};
    return RestaurantWebsiteColors(
      primary: _pickColor(
        branding['primary'],
        restaurantInfo.primaryColor,
        fallback?.primary ?? '#E4572E',
      ),
      accent: _pickColor(
        branding['accent'],
        restaurantInfo.accentColor,
        fallback?.accent ?? '#F5C400',
      ),
      bg: _pickColor(
        branding['secondary'],
        restaurantInfo.secondaryColor,
        fallback?.bg ?? '#0B0B0B',
      ),
      backgroundBase: _pickColor(
        branding['background'],
        null,
        fallback?.backgroundBase ?? '#F7F7F5',
      ),
      surface: _pickColor(
        branding['surface'],
        null,
        fallback?.surface ?? '#FFFFFF',
      ),
      text: _pickColor(
        branding['textPrimary'],
        null,
        fallback?.text ?? '#111111',
      ),
      textMuted: _pickColor(
        branding['textSecondary'],
        null,
        fallback?.textMuted ?? '#B8B8B8',
      ),
    );
  }

  String _pickColor(dynamic preferred, String? fallback, String defaultValue) {
    final direct = preferred?.toString();
    if (direct != null && direct.trim().isNotEmpty) return direct;
    if (fallback != null && fallback.trim().isNotEmpty) return fallback;
    return defaultValue;
  }

  String? _buildSubtitle(RestaurantInfo info) {
    final city = info.city ?? '';
    final state = info.state ?? '';
    if (city.isEmpty && state.isEmpty) return null;
    if (state.isEmpty) return city;
    if (city.isEmpty) return state;
    return '$city, $state';
  }

  String? _buildAddress(RestaurantInfo info) {
    final line = info.addressLine1 ?? '';
    final city = info.city ?? '';
    final state = info.state ?? '';
    final zip = info.postalCode ?? '';
    final parts = [line, city, state, zip].where((p) => p.isNotEmpty).toList();
    if (parts.isEmpty) return null;
    return parts.join(' ');
  }

  List<RestaurantWebsiteHour>? _mapHoursByDay(Map<String, dynamic>? hours) {
    if (hours == null || hours.isEmpty) return null;
    const dayKeys = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
    const dayLabels = [
      'Lunes',
      'Martes',
      'Miercoles',
      'Jueves',
      'Viernes',
      'Sabado',
      'Domingo',
    ];

    final list = <RestaurantWebsiteHour>[];
    for (var i = 0; i < dayKeys.length; i++) {
      final day = hours[dayKeys[i]] as Map<String, dynamic>?;
      final open = day?['open']?.toString() ?? '';
      final close = day?['close']?.toString() ?? '';
      final closed = day?['closed'] == true;
      list.add(
        RestaurantWebsiteHour(
          dayKey: dayKeys[i],
          dayLabel: dayLabels[i],
          open: open,
          close: close,
          closed: closed || open.isEmpty || close.isEmpty,
        ),
      );
    }
    return list;
  }

  String _buildHoursText(List<RestaurantWebsiteHour> hours) {
    if (hours.isEmpty) return '';
    final ranges = hours.map((row) => row.rangeLabel).toList();
    final segments = <_HourSegment>[];
    var start = 0;
    for (var i = 1; i < ranges.length; i++) {
      if (ranges[i] != ranges[i - 1]) {
        segments.add(_HourSegment(start, i - 1, ranges[i - 1]));
        start = i;
      }
    }
    segments.add(_HourSegment(start, ranges.length - 1, ranges.last));

    final short = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
    final normalizedSegments = (segments.length > 1 && segments.first.range == segments.last.range)
        ? [
            _HourSegment(segments.last.startIndex, segments.first.endIndex, segments.first.range),
            ...segments.sublist(1, segments.length - 1),
          ]
        : segments;
    return normalizedSegments.map((segment) {
      final startLabel = short[segment.startIndex];
      final endLabel = short[segment.endIndex];
      final label = segment.startIndex == segment.endIndex ? startLabel : '$startLabel-$endLabel';
      return '$label ${segment.range}';
    }).join(' | ');
  }

  int _toInt(dynamic value) {
    if (value is int) return value;
    if (value is double) return value.round();
    if (value is String) return int.tryParse(value) ?? 0;
    return 0;
  }

  double _toDouble(dynamic value) {
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0;
    return 0;
  }

  List<String> _toStringList(dynamic value) {
    if (value is List) {
      return value.map((e) => e.toString()).where((e) => e.trim().isNotEmpty).toList();
    }
    return const [];
  }

  String _slugify(String input) {
    final normalized = input
        .toLowerCase()
        .replaceAll(RegExp(r'[^a-z0-9\s-]'), '')
        .replaceAll(RegExp(r'\s+'), '-')
        .replaceAll(RegExp(r'-+'), '-')
        .replaceAll(RegExp(r'^-|-$'), '');
    return normalized.isEmpty ? 'item' : normalized;
  }

  bool _isNetworkError(Object error) {
    final text = error.toString();
    return text.contains('ClientException') ||
        text.contains('Failed to fetch') ||
        text.contains('SocketException');
  }
}

class _HourSegment {
  final int startIndex;
  final int endIndex;
  final String range;

  const _HourSegment(this.startIndex, this.endIndex, this.range);
}
