class MenuCategory {
  final String id;
  final String name;
  final String description;
  final String imageUrl;

  const MenuCategory({
    required this.id,
    required this.name,
    required this.description,
    required this.imageUrl,
  });
}

class MenuItemModel {
  final String id;
  final String categoryId;
  final String name;
  final String description;
  final double price;
  final String imageUrl;
  final bool isAvailable;
  final bool isActive;
  final List<String> tags;
  final List<String> allergens;
  final int? preparationTime;

  const MenuItemModel({
    required this.id,
    required this.categoryId,
    required this.name,
    required this.description,
    required this.price,
    required this.imageUrl,
    required this.isAvailable,
    required this.isActive,
    required this.tags,
    required this.allergens,
    required this.preparationTime,
  });
}

class TenantBranding {
  final String slug;
  final String name;
  final String tagline;

  const TenantBranding({
    required this.slug,
    required this.name,
    required this.tagline,
  });
}

class RestaurantInfo {
  final String id;
  final String name;
  final String slug;
  final String? logoUrl;
  final String? bannerUrl;
  final String? phone;
  final String? email;
  final String? addressLine1;
  final String? city;
  final String? state;
  final String? postalCode;
  final Map<String, dynamic>? operatingHours;
  final String? primaryColor;
  final String? secondaryColor;
  final String? accentColor;
  final Map<String, dynamic>? branding;

  const RestaurantInfo({
    required this.id,
    required this.name,
    required this.slug,
    this.logoUrl,
    this.bannerUrl,
    this.phone,
    this.email,
    this.addressLine1,
    this.city,
    this.state,
    this.postalCode,
    this.operatingHours,
    this.primaryColor,
    this.secondaryColor,
    this.accentColor,
    this.branding,
  });

  factory RestaurantInfo.fromJson(Map<String, dynamic> json) {
    return RestaurantInfo(
      id: json['id'] as String,
      name: (json['name'] ?? '') as String,
      slug: (json['slug'] ?? '') as String,
      logoUrl: json['logoUrl'] as String?,
      bannerUrl: json['bannerUrl'] as String?,
      phone: json['phone'] as String?,
      email: json['email'] as String?,
      addressLine1: json['addressLine1'] as String?,
      city: json['city'] as String?,
      state: json['state'] as String?,
      postalCode: json['postalCode'] as String?,
      operatingHours: json['operatingHours'] as Map<String, dynamic>?,
      primaryColor: json['primaryColor'] as String?,
      secondaryColor: json['secondaryColor'] as String?,
      accentColor: json['accentColor'] as String?,
      branding: json['branding'] as Map<String, dynamic>?,
    );
  }
}
