// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;

class I18nStorage {
  static const _key = 'restaurant_web_locale';

  String? read() => html.window.localStorage[_key];

  void write(String code) {
    html.window.localStorage[_key] = code;
  }
}

I18nStorage createStorage() => I18nStorage();
