import 'menu_models.dart';
import '../../core/i18n/app_strings.dart';
import '../../features/storefront/branding.dart';

class RestaurantWebsitePayload {
  final RestaurantWebsiteRestaurant restaurant;
  final List<RestaurantWebsiteCategory> categories;
  final List<RestaurantWebsiteItem> items;
  final RestaurantWebsiteFeatured featured;
  final List<RestaurantWebsiteFeaturedSection> featuredSections;
  final RestaurantWebsitePromo? promo;
  final List<RestaurantWebsiteReview> reviews;

  const RestaurantWebsitePayload({
    required this.restaurant,
    required this.categories,
    required this.items,
    required this.featured,
    required this.featuredSections,
    required this.promo,
    required this.reviews,
  });
}

class RestaurantWebsiteRestaurant {
  final String id;
  final String slug;
  final String name;
  final String subtitle;
  final String phone;
  final String? email;
  final String address;
  final String hoursText;
  final List<RestaurantWebsiteHour> hoursByDay;
  final String logoUrl;
  final RestaurantWebsiteColors colors;
  final RestaurantWebsiteHero hero;
  final RestaurantWebsiteEtas etas;
  final RestaurantWebsiteSocial social;
  final RestaurantWebsiteLanguages languages;

  const RestaurantWebsiteRestaurant({
    required this.id,
    required this.slug,
    required this.name,
    required this.subtitle,
    required this.phone,
    required this.email,
    required this.address,
    required this.hoursText,
    required this.hoursByDay,
    required this.logoUrl,
    required this.colors,
    required this.hero,
    required this.etas,
    required this.social,
    required this.languages,
  });

  RestaurantInfo toRestaurantInfo() {
    return RestaurantInfo(
      id: id,
      name: name,
      slug: slug,
      logoUrl: logoUrl,
      phone: phone,
      email: email,
      addressLine1: address,
      city: subtitle,
      state: '',
      primaryColor: colors.primary,
      secondaryColor: colors.bg,
      accentColor: colors.accent,
      branding: {
        'primary': colors.primary,
        'accent': colors.accent,
        'background': colors.backgroundBase,
      },
      operatingHours: _hoursToMap(),
    );
  }

  List<HourRow> toHourRows({String localeCode = AppStrings.defaultLocale}) {
    return hoursByDay
        .map((row) => HourRow(
              dayKey: row.dayKey,
              dayLabel: row.dayLabelFor(localeCode),
              range: row.rangeLabelFor(localeCode),
            ))
        .toList();
  }

  Map<String, dynamic> _hoursToMap() {
    final map = <String, dynamic>{};
    for (final row in hoursByDay) {
      map[row.dayKey] = {
        'open': row.open,
        'close': row.close,
        'closed': row.closed,
      };
    }
    return map;
  }
}

class RestaurantWebsiteColors {
  final String primary;
  final String accent;
  final String bg;
  final String backgroundBase;
  final String surface;
  final String text;
  final String textMuted;

  const RestaurantWebsiteColors({
    required this.primary,
    required this.accent,
    required this.bg,
    required this.backgroundBase,
    required this.surface,
    required this.text,
    required this.textMuted,
  });
}

class RestaurantWebsiteHero {
  final String badgeText;
  final String title1;
  final String title2;
  final String description;
  final String bgStyle;
  final String? bgImageUrl;

  const RestaurantWebsiteHero({
    required this.badgeText,
    required this.title1,
    required this.title2,
    required this.description,
    required this.bgStyle,
    required this.bgImageUrl,
  });
}

class RestaurantWebsiteEtas {
  final int pickupMin;
  final int pickupMax;
  final int deliveryMin;
  final int deliveryMax;

  const RestaurantWebsiteEtas({
    required this.pickupMin,
    required this.pickupMax,
    required this.deliveryMin,
    required this.deliveryMax,
  });
}

class RestaurantWebsiteSocial {
  final String? instagram;
  final String? tiktok;

  const RestaurantWebsiteSocial({
    required this.instagram,
    required this.tiktok,
  });
}

class RestaurantWebsiteLanguages {
  final String defaultLang;
  final List<String> enabled;

  const RestaurantWebsiteLanguages({
    required this.defaultLang,
    required this.enabled,
  });
}

class RestaurantWebsiteCategory {
  final String id;
  final String name;
  final String? icon;
  final int displayOrder;

  const RestaurantWebsiteCategory({
    required this.id,
    required this.name,
    required this.icon,
    required this.displayOrder,
  });
}

class RestaurantWebsiteItem {
  final String id;
  final String categoryId;
  final String name;
  final String slug;
  final String? description;
  final double price;
  final String? imageUrl;
  final List<String> tags;
  final bool isAvailable;
  final int displayOrder;

  const RestaurantWebsiteItem({
    required this.id,
    required this.categoryId,
    required this.name,
    required this.slug,
    required this.description,
    required this.price,
    required this.imageUrl,
    required this.tags,
    required this.isAvailable,
    required this.displayOrder,
  });
}

class RestaurantWebsiteFeatured {
  final String mostOrderedTag;
  final int limit;

  const RestaurantWebsiteFeatured({
    required this.mostOrderedTag,
    required this.limit,
  });
}

class RestaurantWebsiteFeaturedSection {
  final String key;
  final String title;
  final List<RestaurantWebsiteFeaturedItem> items;

  const RestaurantWebsiteFeaturedSection({
    required this.key,
    required this.title,
    required this.items,
  });
}

class RestaurantWebsiteFeaturedItem {
  final String id;
  final String type;
  final String title;
  final String? subtitle;
  final double price;
  final String? imageUrl;
  final String ctaLabel;
  final bool requiresConfiguration;

  const RestaurantWebsiteFeaturedItem({
    required this.id,
    required this.type,
    required this.title,
    required this.subtitle,
    required this.price,
    required this.imageUrl,
    required this.ctaLabel,
    required this.requiresConfiguration,
  });
}

class RestaurantWebsitePromo {
  final String itemSlug;
  final String title;
  final String subtitle;
  final String priceText;
  final String? note;
  final String buttonText;

  const RestaurantWebsitePromo({
    required this.itemSlug,
    required this.title,
    required this.subtitle,
    required this.priceText,
    required this.note,
    required this.buttonText,
  });
}

class RestaurantWebsiteReview {
  final int rating;
  final String quote;
  final String author;

  const RestaurantWebsiteReview({
    required this.rating,
    required this.quote,
    required this.author,
  });
}

class RestaurantWebsiteHour {
  final String dayKey;
  final String dayLabel;
  final String open;
  final String close;
  final bool closed;

  const RestaurantWebsiteHour({
    required this.dayKey,
    required this.dayLabel,
    required this.open,
    required this.close,
    required this.closed,
  });

  String get rangeLabel {
    return rangeLabelFor(AppStrings.defaultLocale);
  }

  String rangeLabelFor(String localeCode) {
    final closedLabel = AppStrings.t(localeCode, 'hours.closed');
    if (closed) return closedLabel;
    return '${_formatTime(open)} - ${_formatTime(close)}';
  }

  String dayLabelFor(String localeCode) {
    return AppStrings.t(localeCode, 'day.$dayKey');
  }

  String _formatTime(String value) {
    final parts = value.split(':');
    if (parts.length < 2) return value;
    final hour = int.tryParse(parts[0]);
    final minute = int.tryParse(parts[1]);
    if (hour == null || minute == null) return value;
    final suffix = hour >= 12 ? 'PM' : 'AM';
    var hour12 = hour % 12;
    if (hour12 == 0) hour12 = 12;
    final minuteText = minute.toString().padLeft(2, '0');
    return '$hour12:$minuteText $suffix';
  }
}
