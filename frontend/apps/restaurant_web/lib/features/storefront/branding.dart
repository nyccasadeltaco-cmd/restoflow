import 'package:flutter/material.dart';
import '../../core/i18n/app_strings.dart';
import '../../data/models/menu_models.dart';

class BrandingColors {
  final Color primary;
  final Color secondary;
  final Color accent;
  final Color background;
  final Color surface;
  final Color textPrimary;
  final Color textSecondary;
  final Color success;

  const BrandingColors({
    required this.primary,
    required this.secondary,
    required this.accent,
    required this.background,
    required this.surface,
    required this.textPrimary,
    required this.textSecondary,
    required this.success,
  });

  factory BrandingColors.fromRestaurant(RestaurantInfo? restaurant) {
    final branding = restaurant?.branding;
    return BrandingColors(
      primary: _parseHexColor(
        branding?['primary'] as String?,
        _parseHexColor(restaurant?.primaryColor, const Color(0xFFE65227)),
      ),
      secondary: _parseHexColor(
        branding?['secondary'] as String?,
        _parseHexColor(restaurant?.secondaryColor, Colors.black),
      ),
      accent: _parseHexColor(
        branding?['accent'] as String?,
        _parseHexColor(restaurant?.accentColor, const Color(0xFFFFC107)),
      ),
      background: _parseHexColor(branding?['background'] as String?, const Color(0xFFF7F7F5)),
      surface: _parseHexColor(branding?['surface'] as String?, Colors.white),
      textPrimary: _parseHexColor(branding?['textPrimary'] as String?, const Color(0xFF111111)),
      textSecondary: _parseHexColor(branding?['textSecondary'] as String?, const Color(0xFF6B6B6B)),
      success: _parseHexColor(branding?['success'] as String?, const Color(0xFF25D366)),
    );
  }
}

Color _parseHexColor(String? value, Color fallback) {
  if (value == null || value.trim().isEmpty) return fallback;
  var text = value.trim().toLowerCase();
  if (text.startsWith('#')) text = text.substring(1);
  if (text.startsWith('0x')) text = text.substring(2);
  if (text.length == 6) {
    text = 'ff$text';
  }
  if (text.length != 8) return fallback;
  final parsed = int.tryParse(text, radix: 16);
  if (parsed == null) return fallback;
  return Color(parsed);
}

String formatLocation(RestaurantInfo? info) {
  final city = info?.city ?? '';
  final state = info?.state ?? '';
  if (city.isEmpty && state.isEmpty) return '';
  if (state.isEmpty) return city;
  if (city.isEmpty) return state;
  return '$city, $state';
}

String formatAddress(RestaurantInfo? info) {
  final line = info?.addressLine1 ?? '';
  final city = info?.city ?? '';
  final state = info?.state ?? '';
  final zip = info?.postalCode ?? '';
  final parts = [line, city, state, zip].where((p) => p.isNotEmpty).toList();
  return parts.join(' ');
}

String formatHoursSummary(
  Map<String, dynamic>? hours, {
  String localeCode = AppStrings.defaultLocale,
}) {
  final segments = _buildHourSegments(hours, localeCode);
  if (segments.isEmpty) return '';
  return segments
      .map((segment) => '${segment.label(localeCode)} ${segment.range}')
      .join(' | ');
}

List<HourRow> buildHourRows(
  Map<String, dynamic>? hours, {
  String localeCode = AppStrings.defaultLocale,
}) {
  return _dayKeys
      .asMap()
      .entries
      .map((entry) => HourRow(
            dayKey: entry.value,
            dayLabel: _dayLabel(entry.value, localeCode),
            range: _formatDayRange(
              hours?[entry.value] as Map<String, dynamic>?,
              localeCode: localeCode,
            ),
          ))
      .toList();
}

class HourRow {
  final String dayKey;
  final String dayLabel;
  final String range;

  const HourRow({
    required this.dayKey,
    required this.dayLabel,
    required this.range,
  });
}

class _HourSegment {
  final int startIndex;
  final int endIndex;
  final String range;

  const _HourSegment({
    required this.startIndex,
    required this.endIndex,
    required this.range,
  });

  String label(String localeCode) {
    final start = _dayShortLabel(_dayKeys[startIndex], localeCode);
    final end = _dayShortLabel(_dayKeys[endIndex], localeCode);
    return startIndex == endIndex ? start : '$start-$end';
  }
}

List<_HourSegment> _buildHourSegments(
  Map<String, dynamic>? hours,
  String localeCode,
) {
  if (hours == null || hours.isEmpty) return [];
  final ranges = _dayKeys
      .map(
        (key) => _formatDayRange(
          hours[key] as Map<String, dynamic>?,
          localeCode: localeCode,
        ),
      )
      .toList();

  final segments = <_HourSegment>[];
  var start = 0;
  for (var i = 1; i < ranges.length; i++) {
    if (ranges[i] != ranges[i - 1]) {
      segments.add(_HourSegment(startIndex: start, endIndex: i - 1, range: ranges[i - 1]));
      start = i;
    }
  }
  segments.add(_HourSegment(startIndex: start, endIndex: ranges.length - 1, range: ranges.last));
  if (segments.length > 1 && segments.first.range == segments.last.range) {
    final merged = _HourSegment(
      startIndex: segments.last.startIndex,
      endIndex: segments.first.endIndex,
      range: segments.first.range,
    );
    return [merged, ...segments.sublist(1, segments.length - 1)];
  }
  return segments;
}

String _formatDayRange(
  Map<String, dynamic>? day, {
  required String localeCode,
}) {
  final closedLabel = AppStrings.t(localeCode, 'hours.closed');
  if (day == null) return closedLabel;
  final closed = day['closed'] == true;
  if (closed) return closedLabel;
  final open = day['open']?.toString();
  final close = day['close']?.toString();
  if (open == null || close == null) return closedLabel;
  return '${_formatTime(open)} - ${_formatTime(close)}';
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

const List<String> _dayKeys = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

String _dayLabel(String dayKey, String localeCode) {
  return AppStrings.t(localeCode, 'day.$dayKey');
}

String _dayShortLabel(String dayKey, String localeCode) {
  return AppStrings.t(localeCode, 'dayShort.$dayKey');
}
