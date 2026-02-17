class I18nStorage {
  String? _value;

  String? read() => _value;

  void write(String code) {
    _value = code;
  }
}

I18nStorage createStorage() => I18nStorage();
