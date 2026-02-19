// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../../data/state/cart_store.dart';
import '../../../data/state/tenant_menu_provider.dart';
import '../../menu/menu_api_service.dart';
import '../../../data/models/menu_models.dart';
import '../../../data/state/language_provider.dart';
import '../branding.dart';
import '../widgets/storefront_shell.dart';

class CheckoutPage extends StatefulWidget {
  final String slug;
  const CheckoutPage({super.key, required this.slug});

  @override
  State<CheckoutPage> createState() => _CheckoutPageState();
}

class _CheckoutPageState extends State<CheckoutPage> {
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  double _tipPercent = 0.0;
  String _orderType = 'pickup';
  String _paymentMethod = 'cash';
  bool _submitting = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    _emailCtrl.dispose();
    _notesCtrl.dispose();
    _addressCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartStore>();
    final menuProvider = context.watch<TenantMenuProvider>();
    final restaurant = menuProvider.restaurant;
    final colors = BrandingColors.fromRestaurant(restaurant);
    final lang = context.watch<LanguageProvider>();
    final isNarrow = MediaQuery.of(context).size.width < 900;

    final subtotal = cart.subtotal;
    final tax = subtotal * 0.08875;
    final tipAmount = subtotal * _tipPercent;
    final total = subtotal + tax + tipAmount;

    return StorefrontShell(
      restaurant: restaurant,
      slug: widget.slug,
      activeTab: 'cart',
      cartQty: cart.totalQty,
      showFooter: false,
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
          child: isNarrow
              ? Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(lang.t('checkout.title'),
                        style: Theme.of(context).textTheme.headlineSmall),
                    const SizedBox(height: 16),
                    _OrderTypeSelector(
                      selected: _orderType,
                      onChange: (value) => setState(() => _orderType = value),
                      colors: colors,
                    ),
                    const SizedBox(height: 24),
                    _CartItems(cart: cart, colors: colors),
                    const SizedBox(height: 24),
                    _CustomerInfoForm(
                      nameCtrl: _nameCtrl,
                      phoneCtrl: _phoneCtrl,
                      emailCtrl: _emailCtrl,
                      notesCtrl: _notesCtrl,
                      addressCtrl: _addressCtrl,
                      requireAddress: _orderType == 'delivery',
                      colors: colors,
                    ),
                    const SizedBox(height: 24),
                    _PaymentMethods(
                      colors: colors,
                      selected: _paymentMethod,
                      onChange: (value) =>
                          setState(() => _paymentMethod = value),
                    ),
                    const SizedBox(height: 24),
                    _OrderSummary(
                      subtotal: subtotal,
                      tax: tax,
                      total: total,
                      tipPercent: _tipPercent,
                      onTipChange: (value) =>
                          setState(() => _tipPercent = value),
                      onSubmit: cart.lines.isEmpty || _submitting
                          ? null
                          : () => _submitOrder(context, cart),
                      submitting: _submitting,
                      colors: colors,
                    ),
                  ],
                )
              : Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      flex: 2,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(lang.t('checkout.title'),
                              style: Theme.of(context).textTheme.headlineSmall),
                          const SizedBox(height: 16),
                          _OrderTypeSelector(
                            selected: _orderType,
                            onChange: (value) =>
                                setState(() => _orderType = value),
                            colors: colors,
                          ),
                          const SizedBox(height: 24),
                          _CartItems(cart: cart, colors: colors),
                          const SizedBox(height: 24),
                          _CustomerInfoForm(
                            nameCtrl: _nameCtrl,
                            phoneCtrl: _phoneCtrl,
                            emailCtrl: _emailCtrl,
                            notesCtrl: _notesCtrl,
                            addressCtrl: _addressCtrl,
                            requireAddress: _orderType == 'delivery',
                            colors: colors,
                          ),
                          const SizedBox(height: 24),
                          _PaymentMethods(
                            colors: colors,
                            selected: _paymentMethod,
                            onChange: (value) =>
                                setState(() => _paymentMethod = value),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 24),
                    Expanded(
                      child: _OrderSummary(
                        subtotal: subtotal,
                        tax: tax,
                        total: total,
                        tipPercent: _tipPercent,
                        onTipChange: (value) =>
                            setState(() => _tipPercent = value),
                        onSubmit: cart.lines.isEmpty || _submitting
                            ? null
                            : () => _submitOrder(context, cart),
                        submitting: _submitting,
                        colors: colors,
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }

  Future<void> _submitOrder(BuildContext context, CartStore cart) async {
    if (_nameCtrl.text.trim().isEmpty || _phoneCtrl.text.trim().isEmpty) {
      final lang = context.read<LanguageProvider>();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(lang.t('checkout.completeNamePhone'))),
      );
      return;
    }

    final normalizedPhone = _normalizeUsPhone(_phoneCtrl.text);
    if (normalizedPhone == null) {
      final lang = context.read<LanguageProvider>();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(lang.t('checkout.invalidPhone'))),
      );
      return;
    }

    final normalizedEmail = _normalizeEmail(_emailCtrl.text);
    if (_emailCtrl.text.trim().isNotEmpty && normalizedEmail == null) {
      final lang = context.read<LanguageProvider>();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(lang.t('checkout.invalidEmail'))),
      );
      return;
    }
    if (_orderType == 'delivery' && _addressCtrl.text.trim().isEmpty) {
      final lang = context.read<LanguageProvider>();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(lang.t('checkout.completeAddress'))),
      );
      return;
    }

    setState(() => _submitting = true);
    try {
      final api = MenuApiService();
      final lang = context.read<LanguageProvider>();
      final noteParts = <String>[];
      if (_orderType == 'delivery' && _addressCtrl.text.trim().isNotEmpty) {
        noteParts.add(
            '${lang.t('checkout.addressLabel')}: ${_addressCtrl.text.trim()}');
      }
      if (_notesCtrl.text.trim().isNotEmpty) {
        noteParts.add(_notesCtrl.text.trim());
      }
      final combinedNotes = noteParts.isEmpty ? null : noteParts.join('\n');
      final payload = {
        'source': 'LINK',
        'customerName': _nameCtrl.text.trim(),
        'customerPhone': normalizedPhone,
        'notes': combinedNotes,
        'tipAmount': cart.subtotal * _tipPercent,
        'items': cart.lines
            .map((line) => {
                  'itemType':
                      line.type == CartItemType.combo ? 'combo' : 'menu_item',
                  if (line.type == CartItemType.combo) 'comboId': line.id,
                  if (line.type == CartItemType.menuItem) 'menuItemId': line.id,
                  'quantity': line.qty,
                })
            .toList(),
      };
      if (_paymentMethod == 'card') {
        final baseUrl = Uri.base.origin;
        final sessionPayload = {
          ...payload,
          'returnUrl': baseUrl,
        };
        final session =
            await api.createCheckoutSession(widget.slug, sessionPayload);
        if (session == null) {
          if (!mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(lang.t('checkout.orderFail'))),
          );
          return;
        }
        if (session['requiresOnboarding'] == true &&
            session['onboardingUrl'] != null) {
          if (!mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content:
                  Text('Pagos con tarjeta no disponibles. Configura Stripe.'),
            ),
          );
          html.window.open(session['onboardingUrl'].toString(), '_blank');
          return;
        }
        final url = session['url']?.toString();
        if (url == null || url.isEmpty) {
          if (!mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(lang.t('checkout.orderFail'))),
          );
          return;
        }
        html.window.location.href = url;
        return;
      }

      final result = await api.createPublicOrder(widget.slug, payload);
      if (result != null && result['id'] != null) {
        cart.clear();
        if (!mounted) return;
        Navigator.of(context)
            .pushNamed('/r/${widget.slug}/success/${result['id']}');
        return;
      }

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(lang.t('checkout.orderFail'))),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text(context
                .read<LanguageProvider>()
                .t('errors.generic', vars: {'error': '$e'}))),
      );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }
}

class _OrderTypeSelector extends StatelessWidget {
  final String selected;
  final ValueChanged<String> onChange;
  final BrandingColors colors;

  const _OrderTypeSelector({
    required this.selected,
    required this.onChange,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    return Row(
      children: [
        _TypeCard(
          title: lang.t('home.pickup'),
          subtitle: '15-20 min',
          icon: Icons.storefront,
          selected: selected == 'pickup',
          onTap: () => onChange('pickup'),
          colors: colors,
        ),
        const SizedBox(width: 12),
        _TypeCard(
          title: lang.t('home.delivery'),
          subtitle: '30-45 min',
          icon: Icons.local_shipping,
          selected: selected == 'delivery',
          onTap: () => onChange('delivery'),
          colors: colors,
        ),
      ],
    );
  }
}

class _TypeCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;
  final BrandingColors colors;

  const _TypeCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.selected,
    required this.onTap,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: selected ? colors.accent.withOpacity(0.2) : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
                color: selected ? colors.primary : Colors.grey.shade300),
          ),
          child: Row(
            children: [
              CircleAvatar(
                backgroundColor: colors.accent.withOpacity(0.2),
                child: Icon(icon, color: colors.primary),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                  Text(subtitle, style: const TextStyle(color: Colors.black54)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CartItems extends StatelessWidget {
  final CartStore cart;
  final BrandingColors colors;
  const _CartItems({required this.cart, required this.colors});

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            lang.t('checkout.cartTitle', vars: {'count': '${cart.totalQty}'}),
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          if (cart.lines.isEmpty)
            Text(lang.t('checkout.cartEmpty'))
          else
            ...cart.lines.map((line) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  children: [
                    Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF0C1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child:
                          const Icon(Icons.local_dining, color: Colors.black54),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(line.name,
                              style:
                                  const TextStyle(fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              _QtyButton(
                                icon: Icons.remove,
                                onTap: () => cart.removeOne(line.type, line.id),
                              ),
                              Padding(
                                padding:
                                    const EdgeInsets.symmetric(horizontal: 8),
                                child: Text('${line.qty}'),
                              ),
                              _QtyButton(
                                icon: Icons.add,
                                onTap: () {
                                  if (line.type == CartItemType.combo) {
                                    cart.addCombo(
                                      id: line.id,
                                      name: line.name,
                                      description: line.description,
                                      price: line.price,
                                      imageUrl: line.imageUrl,
                                    );
                                  } else {
                                    cart.addMenuItem(MenuItemModel(
                                      id: line.id,
                                      categoryId: '',
                                      name: line.name,
                                      description: line.description,
                                      price: line.price,
                                      imageUrl: line.imageUrl,
                                      isAvailable: true,
                                      isActive: true,
                                      tags: const [],
                                      allergens: const [],
                                      preparationTime: null,
                                    ));
                                  }
                                },
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    Text('\$${(line.price * line.qty).toStringAsFixed(2)}',
                        style: TextStyle(
                            color: colors.primary,
                            fontWeight: FontWeight.bold)),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }
}

class _QtyButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _QtyButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        width: 28,
        height: 28,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.grey.shade300),
        ),
        child: Icon(icon, size: 16),
      ),
    );
  }
}

class _CustomerInfoForm extends StatelessWidget {
  final TextEditingController nameCtrl;
  final TextEditingController phoneCtrl;
  final TextEditingController emailCtrl;
  final TextEditingController notesCtrl;
  final TextEditingController addressCtrl;
  final bool requireAddress;
  final BrandingColors colors;

  const _CustomerInfoForm({
    required this.nameCtrl,
    required this.phoneCtrl,
    required this.emailCtrl,
    required this.notesCtrl,
    required this.addressCtrl,
    required this.requireAddress,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(lang.t('checkout.customerInfo'),
              style: const TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: nameCtrl,
                  decoration:
                      InputDecoration(labelText: lang.t('checkout.name')),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: TextField(
                  controller: phoneCtrl,
                  keyboardType: TextInputType.phone,
                  inputFormatters: const [_UsPhoneInputFormatter()],
                  decoration:
                      InputDecoration(labelText: lang.t('checkout.phone')),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          TextField(
            controller: emailCtrl,
            keyboardType: TextInputType.emailAddress,
            decoration:
                InputDecoration(labelText: lang.t('checkout.emailOptional')),
          ),
          if (requireAddress) ...[
            const SizedBox(height: 12),
            TextField(
              controller: addressCtrl,
              decoration:
                  InputDecoration(labelText: lang.t('checkout.address')),
            ),
          ],
          const SizedBox(height: 12),
          TextField(
            controller: notesCtrl,
            decoration:
                InputDecoration(labelText: lang.t('checkout.notesOptional')),
            maxLines: 3,
          ),
        ],
      ),
    );
  }
}

class _PaymentMethods extends StatelessWidget {
  final BrandingColors colors;
  final String selected;
  final ValueChanged<String> onChange;
  const _PaymentMethods({
    required this.colors,
    required this.selected,
    required this.onChange,
  });

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(lang.t('checkout.paymentMethod'),
              style: const TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _PaymentCard(
                  title: lang.t('checkout.cash'),
                  subtitle: lang.t('checkout.cashSubtitle'),
                  selected: selected == 'cash',
                  icon: Icons.payments_outlined,
                  colors: colors,
                  onTap: () => onChange('cash'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _PaymentCard(
                  title: lang.t('checkout.card'),
                  subtitle: lang.t('checkout.cardSubtitle'),
                  selected: selected == 'card',
                  icon: Icons.credit_card,
                  colors: colors,
                  onTap: () => onChange('card'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _PaymentCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final bool selected;
  final IconData icon;
  final BrandingColors colors;
  final VoidCallback onTap;

  const _PaymentCard({
    required this.title,
    required this.subtitle,
    required this.selected,
    required this.icon,
    required this.colors,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: selected ? colors.accent.withOpacity(0.2) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
              color: selected ? colors.primary : Colors.grey.shade300),
        ),
        child: Column(
          children: [
            Icon(icon, color: colors.primary),
            const SizedBox(height: 8),
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
            Text(subtitle,
                style: const TextStyle(color: Colors.black54, fontSize: 12)),
          ],
        ),
      ),
    );
  }
}

String? _normalizeUsPhone(String raw) {
  final digits = raw.replaceAll(RegExp(r'\D'), '');
  if (digits.length == 10) return digits;
  if (digits.length == 11 && digits.startsWith('1')) {
    return digits.substring(1);
  }
  return null;
}

String? _normalizeEmail(String raw) {
  final email = raw.trim().toLowerCase();
  if (email.isEmpty) return null;
  const pattern = r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
  if (!RegExp(pattern).hasMatch(email)) return null;
  return email;
}

class _UsPhoneInputFormatter extends TextInputFormatter {
  const _UsPhoneInputFormatter();

  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final digits = newValue.text.replaceAll(RegExp(r'\D'), '');
    final clamped = digits.length > 10 ? digits.substring(0, 10) : digits;
    final formatted = _format(clamped);
    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }

  String _format(String digits) {
    if (digits.isEmpty) return '';
    if (digits.length <= 3) return '(${digits.substring(0, digits.length)}';
    if (digits.length <= 6) {
      return '(${digits.substring(0, 3)}) ${digits.substring(3)}';
    }
    return '(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}';
  }
}

class _OrderSummary extends StatelessWidget {
  final double subtotal;
  final double tax;
  final double total;
  final double tipPercent;
  final VoidCallback? onSubmit;
  final bool submitting;
  final ValueChanged<double> onTipChange;
  final BrandingColors colors;

  const _OrderSummary({
    required this.subtotal,
    required this.tax,
    required this.total,
    required this.tipPercent,
    required this.onTipChange,
    required this.onSubmit,
    required this.submitting,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(lang.t('checkout.summary'),
              style: const TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          Text(lang.t('checkout.addTip')),
          const SizedBox(height: 8),
          Row(
            children: [
              _TipButton(
                label: lang.t('checkout.tipNone'),
                active: tipPercent == 0,
                onTap: () => onTipChange(0),
                colors: colors,
              ),
              const SizedBox(width: 8),
              _TipButton(
                label: '15%',
                active: tipPercent == 0.15,
                onTap: () => onTipChange(0.15),
                colors: colors,
              ),
              const SizedBox(width: 8),
              _TipButton(
                label: '18%',
                active: tipPercent == 0.18,
                onTap: () => onTipChange(0.18),
                colors: colors,
              ),
              const SizedBox(width: 8),
              _TipButton(
                label: '20%',
                active: tipPercent == 0.2,
                onTap: () => onTipChange(0.2),
                colors: colors,
              ),
            ],
          ),
          const SizedBox(height: 16),
          _SummaryRow(label: lang.t('checkout.subtotal'), value: subtotal),
          const SizedBox(height: 8),
          _SummaryRow(label: lang.t('checkout.tax'), value: tax),
          const SizedBox(height: 12),
          const Divider(),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(lang.t('checkout.total'),
                  style: const TextStyle(
                      fontWeight: FontWeight.bold, fontSize: 16)),
              Text('\$${total.toStringAsFixed(2)}',
                  style: TextStyle(
                      color: colors.primary,
                      fontWeight: FontWeight.bold,
                      fontSize: 18)),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: colors.primary,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(24)),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              onPressed: onSubmit,
              child: submitting
                  ? const SizedBox(
                      height: 18,
                      width: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white),
                    )
                  : Text(lang.t('checkout.confirm')),
            ),
          ),
          const SizedBox(height: 8),
          Text(lang.t('checkout.terms'),
              style: const TextStyle(color: Colors.black45, fontSize: 12)),
        ],
      ),
    );
  }
}

class _TipButton extends StatelessWidget {
  final String label;
  final bool active;
  final VoidCallback onTap;
  final BrandingColors colors;

  const _TipButton({
    required this.label,
    required this.active,
    required this.onTap,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: active ? colors.primary : Colors.grey.shade200,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                  color: active ? Colors.white : Colors.black87,
                  fontWeight: FontWeight.bold),
            ),
          ),
        ),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final double value;

  const _SummaryRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.black54)),
        Text('\$${value.toStringAsFixed(2)}'),
      ],
    );
  }
}
