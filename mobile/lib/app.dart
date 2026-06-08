import 'package:flutter/material.dart';

import 'auth/auth_controller.dart';
import 'config/app_config.dart';
import 'screens/main_shell.dart';
import 'theme/app_theme.dart';

class CherryHouseApp extends StatefulWidget {
  const CherryHouseApp({super.key, required this.authController});

  final AuthController authController;

  @override
  State<CherryHouseApp> createState() => _CherryHouseAppState();
}

class _CherryHouseAppState extends State<CherryHouseApp> {
  @override
  void initState() {
    super.initState();
    widget.authController.bootstrap();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Cherry House',
      debugShowCheckedModeBanner: AppConfig.isDevelopment,
      theme: AppTheme.light(),
      home: const MainShell(),
    );
  }
}
