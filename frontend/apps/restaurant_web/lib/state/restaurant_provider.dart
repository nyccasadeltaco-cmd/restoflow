import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../data/repos/restaurant_repo.dart';

final restaurantProvider = FutureProvider.family.autoDispose<Map<String, dynamic>?, String>((ref, slug) async {
  final repo = RestaurantRepo(Supabase.instance.client);
  return await repo.getRestaurantBySlug(slug);
});
