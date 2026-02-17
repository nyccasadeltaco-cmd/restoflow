import 'package:flutter/material.dart';

class CategoryTabs extends StatelessWidget {
  final List<String> categories;
  final int selectedIndex;
  final ValueChanged<int> onSelected;
  const CategoryTabs({super.key, required this.categories, required this.selectedIndex, required this.onSelected});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: List.generate(categories.length, (i) => Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4),
          child: ChoiceChip(
            label: Text(categories[i]),
            selected: i == selectedIndex,
            onSelected: (_) => onSelected(i),
          ),
        )),
      ),
    );
  }
}
