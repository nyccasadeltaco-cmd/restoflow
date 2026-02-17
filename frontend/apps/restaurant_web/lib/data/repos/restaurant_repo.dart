import 'package:supabase_flutter/supabase_flutter.dart';

class RestaurantRepo {
  final SupabaseClient db;
  RestaurantRepo(this.db);

  Future<Map<String, dynamic>?> getRestaurantBySlug(String slug) async {
    final cleanSlug = slug.trim().toLowerCase();
    final res = await db
        .from('restaurants')
        .select('id, name, slug, logo_url, banner_url, phone, address_line1, city, state, is_active, operating_hours')
        .eq('slug', cleanSlug)
        .eq('is_active', true)
        .maybeSingle();
    return res;
  }
}
