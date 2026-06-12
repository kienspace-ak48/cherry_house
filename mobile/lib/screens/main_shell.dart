import 'package:flutter/material.dart';

import '../models/models.dart';
import 'booking_discovery_screen.dart';
import 'home_screen.dart';
import 'profile_screen.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _index = 0;
  BookingSearch _bookingSearch = const BookingSearch();
  int _bookingReloadKey = 0;

  void _switchToBooking(BookingSearch search) {
    setState(() {
      _bookingSearch = search;
      _bookingReloadKey += 1;
      _index = 1;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _index,
        children: [
          HomeScreen(onSwitchToBooking: _switchToBooking),
          BookingDiscoveryScreen(
            key: ValueKey(_bookingReloadKey),
            initialSearch: _bookingSearch,
            embeddedInShell: true,
          ),
          const ProfileScreen(),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Trang chủ'),
          NavigationDestination(icon: Icon(Icons.event_available_outlined), selectedIcon: Icon(Icons.event_available), label: 'Đặt phòng'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Tài khoản'),
        ],
      ),
    );
  }
}
