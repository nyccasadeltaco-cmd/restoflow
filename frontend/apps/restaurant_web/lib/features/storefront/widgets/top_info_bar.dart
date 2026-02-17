import 'package:flutter/material.dart';
import 'contact_links.dart';

class TopInfoBar extends StatelessWidget {
  final String phone;
  final String address;
  final String hours;
  const TopInfoBar({super.key, required this.phone, required this.address, required this.hours});

  @override
  Widget build(BuildContext context) {
    final phoneUrl = buildPhoneUrl(phone);
    final addressUrl = buildMapUrl(address);
    return Container(
      color: Colors.orange,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          if (phoneUrl != null)
            LinkText(
              text: phone,
              url: phoneUrl,
              style: const TextStyle(color: Colors.white),
            )
          else
            Text(phone, style: const TextStyle(color: Colors.white)),
          if (addressUrl != null)
            Expanded(
              child: LinkText(
                text: address,
                url: addressUrl,
                style: const TextStyle(color: Colors.white),
                overflow: TextOverflow.ellipsis,
                maxLines: 1,
              ),
            )
          else
            Text(address, style: const TextStyle(color: Colors.white)),
          Text(hours, style: const TextStyle(color: Colors.white)),
        ],
      ),
    );
  }
}
