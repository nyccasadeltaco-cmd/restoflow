import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../data/state/language_provider.dart';

class HeroSection extends StatelessWidget {
  final String title;
  final String subtitle;
  final VoidCallback onMenu;
  final VoidCallback onOrder;

  const HeroSection({
    super.key,
    required this.title,
    required this.subtitle,
    required this.onMenu,
    required this.onOrder,
  });

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.black87, Colors.orange],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: Theme.of(context).textTheme.displaySmall?.copyWith(color: Colors.white)),
          const SizedBox(height: 12),
          Text(subtitle, style: Theme.of(context).textTheme.titleMedium?.copyWith(color: Colors.white70)),
          const SizedBox(height: 24),
          Row(
            children: [
              ElevatedButton(
                onPressed: onMenu,
                child: Text(lang.t('home.viewMenu')),
              ),
              const SizedBox(width: 16),
              OutlinedButton(
                onPressed: onOrder,
                child: Text(lang.t('home.orderNow')),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
