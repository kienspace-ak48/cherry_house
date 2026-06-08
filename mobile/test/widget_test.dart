import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import 'package:mobile/app.dart';
import 'package:mobile/auth/auth_controller.dart';

void main() {
  testWidgets('App loads home', (WidgetTester tester) async {
    final auth = AuthController();
    await tester.pumpWidget(
      ChangeNotifierProvider.value(
        value: auth,
        child: CherryHouseApp(authController: auth),
      ),
    );
    await tester.pump();
    expect(find.text('Cherry House'), findsWidgets);
  });
}
