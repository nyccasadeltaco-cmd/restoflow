import 'package:flutter/foundation.dart';
import '../../core/i18n/app_strings.dart';
import '../../core/i18n/i18n_storage.dart';

class LanguageProvider extends ChangeNotifier {
  String _code = AppStrings.defaultLocale;

  LanguageProvider() {
    final stored = languageStorage.read();
    if (stored != null && AppStrings.supportedLocales.contains(stored)) {
      _code = stored;
    }
  }

  String get code => _code;

  void setCode(String code) {
    if (!AppStrings.supportedLocales.contains(code) || code == _code) return;
    _code = code;
    languageStorage.write(code);
    notifyListeners();
  }

  String t(String key, {Map<String, String>? vars}) {
    return AppStrings.t(_code, key, vars: vars);
  }

  String translateCategory(String name) {
    if (_code != 'EN') return name;
    final normalized = name.trim().toLowerCase();
    if (normalized.isEmpty) return name;
    return _categoryTranslations[normalized] ?? name;
  }

  String translateSectionTitle(String title) {
    if (_code != 'EN') return title;
    final normalized = title.trim().toLowerCase();
    if (normalized.isEmpty) return title;
    return _sectionTranslations[normalized] ?? title;
  }

  String translateCtaLabel(String label) {
    if (_code != 'EN') return label;
    final normalized = label.trim().toLowerCase();
    if (normalized.isEmpty) return label;
    return _ctaTranslations[normalized] ?? label;
  }
}

const Map<String, String> _categoryTranslations = {
  'entradas': 'Starters',
  'platos criollos': 'Creole plates',
  'desayunos': 'Breakfast',
  'bebidas': 'Drinks',
  'platos fuertes': 'Main dishes',
  'tacos': 'Tacos',
  'burritos': 'Burritos',
  'quesadillas': 'Quesadillas',
  'postres': 'Desserts',
  'ensaladas': 'Salads',
  'sopas': 'Soups',
  'combos': 'Combos',
};

const Map<String, String> _sectionTranslations = {
  'favoritos de la casa': 'House Favorites',
  'plato del dia': 'Daily Special',
  'platos del dia': 'Daily Specials',
  'combos': 'Combos',
};

const Map<String, String> _ctaTranslations = {
  'ordenar': 'Order',
  'ordenar ahora': 'Order now',
  'ver menu': 'View menu',
  'ver menú': 'View menu',
  'ver menu completo': 'View full menu',
  'ver menú completo': 'View full menu',
};
