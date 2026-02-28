import 'package:flutter/material.dart';
import 'app_text_field.dart';
import 'app_dropdown.dart';

class AppProductInputForm extends StatelessWidget {
  final List<Map<String, dynamic>> fields;
  final Map<String, TextEditingController> controllers;
  final Map<String, dynamic> formValues;
  final Map<String, Widget>? prefixIcons;
  final Map<String, Widget>? suffixIcons;
  final void Function(String key, String value)? onFieldChanged;
  final EdgeInsetsGeometry padding;

  const AppProductInputForm({
    super.key,
    required this.fields,
    required this.controllers,
    required this.formValues,
    this.prefixIcons,
    this.suffixIcons,
    this.onFieldChanged,
    this.padding = const EdgeInsets.only(top: 24),
  });

  @override
  Widget build(BuildContext context) {
    if (fields.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: padding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (fields.length == 2)
            Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(flex: 7, child: _buildField(fields[0])),
                  const SizedBox(width: 16),
                  Expanded(flex: 5, child: _buildField(fields[1])),
                ],
              ),
            )
          else
            ...fields.map(
              (field) => Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: _buildField(field),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildField(Map<String, dynamic> field) {
    final key = field['name'] ?? field['label'] ?? '';
    final type = (field['type'] ?? 'text').toString().toLowerCase();
    final label = field['label'] ?? key;
    final placeholder = field['placeholder'] ?? 'Enter $label';

    if (!controllers.containsKey(key)) {
      controllers[key] = TextEditingController();
    }

    if (type == 'select') {
      final List options = field['options'] ?? [];
      return AppDropdown<String>(
        hintText: placeholder,
        value: formValues[key],
        items: options.map((opt) {
          final optLabel = (opt is Map ? opt['label'] : opt).toString();
          final optValue = (opt is Map ? opt['value'] : opt).toString();
          return DropdownMenuItem<String>(
            value: optValue,
            child: Text(optLabel),
          );
        }).toList(),
        onChanged: (val) {
          if (val != null && onFieldChanged != null) {
            onFieldChanged!(key, val);
          }
        },
      );
    }

    TextInputType keyboardType = TextInputType.text;
    bool obscureText = false;

    switch (type) {
      case 'number':
        keyboardType = TextInputType.number;
        break;
      case 'tel':
        keyboardType = TextInputType.phone;
        break;
      case 'email':
        keyboardType = TextInputType.emailAddress;
        break;
      case 'password':
        obscureText = true;
        break;
    }

    return AppTextField(
      controller: controllers[key],
      hintText: placeholder,
      keyboardType: keyboardType,
      obscureText: obscureText,
      prefixIcon: prefixIcons?[key],
      suffixIcon: suffixIcons?[key],
      onChanged: (val) {
        if (onFieldChanged != null) {
          onFieldChanged!(key, val);
        }
      },
    );
  }
}
