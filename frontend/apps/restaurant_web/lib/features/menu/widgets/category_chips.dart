import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../data/models/menu_models.dart';
import '../../../data/state/language_provider.dart';

class CategoryChips extends StatelessWidget {
  final List<MenuCategory> categories;
  final String selectedId;
  final ValueChanged<String> onSelect;

  const CategoryChips({
    super.key,
    required this.categories,
    required this.selectedId,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ChoiceChip(
              label: Text(lang.t('menu.categoryAll')),
              selected: selectedId == 'all',
              onSelected: (_) => onSelect('all'),
            ),
          ),
          ...categories.map((c) {
            final selected = c.id == selectedId;
            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: ChoiceChip(
                label: Text(c.name),
                selected: selected,
                onSelected: (_) => onSelect(c.id),
              ),
            );
          }).toList(),
        ],
      ),
    );
  }
}
