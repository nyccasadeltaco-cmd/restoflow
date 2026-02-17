import 'package:flutter/material.dart';

class StoreHeader extends StatelessWidget {
  final String logoUrl;
  final String name;
  final String location;
  const StoreHeader({super.key, required this.logoUrl, required this.name, required this.location});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
      child: Row(
        children: [
          CircleAvatar(
            backgroundImage: NetworkImage(logoUrl),
            radius: 32,
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(name, style: Theme.of(context).textTheme.titleLarge),
              Text(location, style: Theme.of(context).textTheme.titleSmall),
            ],
          ),
        ],
      ),
    );
  }
}
