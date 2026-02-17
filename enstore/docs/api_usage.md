# Flutter API Service Documentation

This document explains how to use the API services implemented in `lib/frontend/api`.

## Overview

The API layer is built using `dio` for HTTP requests and `shared_preferences` for token management. It mirrors the web frontend's structure.

- **Base URL**: Configured in `config.dart`. Default is `http://10.0.2.2:8000` (Android Emulator localhost).
- **Authentication**: Tokens are automatically stored and attached to authenticated requests.

## Authentication (`AuthService`)

### Login

```dart
import 'package:enstore/frontend/api/auth.dart';

void login(String email, String password) async {
  final response = await AuthService().login(email, password);

  if (response.success) {
    print('Login successful! Token: ${response.data?.token}');
    print('User: ${response.data?.user.name}');
  } else {
    print('Login failed: ${response.message}');
    if (response.errors != null) {
      print('Errors: ${response.errors}');
    }
  }
}
```

### Logout

```dart
await AuthService().logout();
```

### Get Profile

```dart
final response = await AuthService().getMe();
if (response.success) {
  print('Attributes: ${response.data}');
}
```

## Products (`ProductService`)

### Get Product List

```dart
import 'package:enstore/frontend/api/products.dart';

void fetchProducts() async {
  // Optional filters
  final filters = {
    'page': 1,
    'per_page': 10,
    'search': 'iphone',
  };

  final response = await ProductService().getProducts(filters: filters);

  if (response.success) {
    final products = response.data?.data ?? [];
    for (var product in products) {
      print('${product.name} - ${product.price}');
    }
  }
}
```

### Get Product Detail

```dart
// By ID
final response = await ProductService().getProductById('1');

// By Slug
final response = await ProductService().getProductBySlug('iphone-15');
```

## Transactions (`TransactionService`)

### Guest Purchase

```dart
import 'package:enstore/frontend/api/transactions.dart';

void buyProduct() async {
  final data = {
    'product_item_id': 123,
    'payment_method': 'bca_va',
    'customer_data': {
      'whatsapp': '08123456789',
    }
  };

  final response = await TransactionService().guestPurchase(data);

  if (response.success) {
    print('Transaction Code: ${response.data?.transaction['transaction_code']}');
    print('Payment URL: ${response.data?.payment['payment_url']}');
  }
}
```

### Check Status

```dart
final response = await TransactionService().getTransactionStatus('TRX-123456');
if (response.success) {
  print('Status: ${response.data?.status}');
}
```

## Customer (`CustomerService`)

### Get Balance

```dart
import 'package:enstore/frontend/api/customer.dart';

final response = await CustomerService().getBalance();
if (response.success) {
  print('Balance: ${response.data?.availableBalance}');
}
  print('Balance: ${response.data?.availableBalance}');
}
```

## Admin Features (`AdminService`)

### Dashboard Statistics

```dart
import 'package:enstore/frontend/api/admin.dart';

final response = await AdminService().getDashboardStats();
if (response.success) {
  print('Total Users: ${response.data?.totalUsers}');
  print('Total Revenue: ${response.data?.totalRevenue}');
}
```

### Manage Products

```dart
// List Products
final response = await AdminService().getProducts(filters: {'page': 1});

// Create Product
final newProduct = await AdminService().createProduct({
  'name': 'New Item',
  'price': 10000,
  'sku': 'ITEM-001',
});
```

## Error Handling

All service methods return an `ApiResponse<T>` object.

- `response.success`: Boolean indicating if the request was successful.
- `response.message`: Success or error message.
- `response.errors`: Map of validation errors (if any).
- `response.data`: The requested data (nullable).

Always check `response.success` before accessing `response.data`.

## Modification

- **Endpoints**: Edit `lib/frontend/api/config.dart`.
- **Models**: Edit `lib/frontend/api/types.dart`.
- **Client Logic**: Edit `lib/frontend/api/client.dart`.

## Handling Form Errors

Errors from the backend are returned in the `response.errors` map, where the key is the field name and the value is a list of error messages.

### Example: Login with Validation

```dart
import 'package:flutter/material.dart';
import 'package:enstore/frontend/api/auth.dart';

class LoginPage extends StatefulWidget {
  @override
  _LoginPageState createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  Map<String, List<String>>? _errors;
  bool _isLoading = false;

  void _login() async {
    setState(() {
      _isLoading = true;
      _errors = null; // Clear previous errors
    });

    final response = await AuthService().login(
      _emailController.text,
      _passwordController.text,
    );

    setState(() => _isLoading = false);

    if (response.success) {
      // Navigate to home
      print('Login Success');
    } else {
      setState(() {
        _errors = response.errors;
      });

      // Show general error message
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(response.message)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _emailController,
              decoration: InputDecoration(
                labelText: 'Email',
                // Display the first error message for 'email' field if exists
                errorText: _errors?['email']?.first,
              ),
            ),
            TextField(
              controller: _passwordController,
              decoration: InputDecoration(
                labelText: 'Password',
                errorText: _errors?['password']?.first,
              ),
              obscureText: true,
            ),
            ElevatedButton(
              onPressed: _isLoading ? null : _login,
              child: _isLoading ? CircularProgressIndicator() : Text('Login'),
            ),
          ],
        ),
      ),
    );
  }
}
```
