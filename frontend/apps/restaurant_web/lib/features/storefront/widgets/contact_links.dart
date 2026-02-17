import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

String? buildPhoneUrl(String phone) {
  final trimmed = phone.trim();
  if (trimmed.isEmpty) return null;
  return 'tel:$trimmed';
}

String? buildMapUrl(String address) {
  final trimmed = address.trim();
  if (trimmed.isEmpty) return null;
  final query = Uri.encodeComponent(trimmed);
  return 'https://www.google.com/maps/search/?api=1&query=$query';
}

String? buildEmailUrl(String email) {
  final trimmed = email.trim();
  if (trimmed.isEmpty) return null;
  return 'mailto:$trimmed';
}

class LinkText extends StatelessWidget {
  final String text;
  final String url;
  final TextStyle style;
  final TextAlign? textAlign;
  final TextOverflow? overflow;
  final int? maxLines;

  const LinkText({
    super.key,
    required this.text,
    required this.url,
    required this.style,
    this.textAlign,
    this.overflow,
    this.maxLines,
  });

  @override
  Widget build(BuildContext context) {
    final linkStyle = style.copyWith(
      decoration: TextDecoration.underline,
      decorationColor: style.color,
    );

    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: InkWell(
        onTap: () => launchUrl(
          Uri.parse(url),
          mode: LaunchMode.platformDefault,
          webOnlyWindowName: '_blank',
        ),
        child: Text(
          text,
          style: linkStyle,
          textAlign: textAlign,
          overflow: overflow,
          maxLines: maxLines,
        ),
      ),
    );
  }
}
