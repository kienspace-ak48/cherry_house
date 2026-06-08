import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'app.dart';
import 'auth/auth_controller.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  final authController = AuthController();
  runApp(
    ChangeNotifierProvider.value(
      value: authController,
      child: CherryHouseApp(authController: authController),
    ),
  );
}
