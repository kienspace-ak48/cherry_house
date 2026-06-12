# Cherry House — Mobile (Flutter)

App user: đăng nhập, tìm cơ sở, đặt phòng, thanh toán (VNPay/MoMo/ví), quản lý booking & ví.

## Yêu cầu

- Flutter SDK ^3.12
- Backend chạy tại `http://localhost:8080` (dev) hoặc `https://kienvu.io.vn` (production)

## Môi trường

| Môi trường | `FLUTTER_ENV` | API mặc định |
|------------|---------------|--------------|
| **Development** | `development` | Android emulator: `http://10.0.2.2:8080/api` |
| **Production** | `production` | `https://kienvu.io.vn/api` |

### Development

```powershell
cd mobile
copy dart_defines.dev.example.json dart_defines.dev.json
# Sửa GOOGLE_WEB_CLIENT_ID = GOOGLE_CLIENT_ID từ backend/.env
flutter pub get
flutter run --dart-define-from-file=dart_defines.dev.json
```

**iOS simulator / máy thật LAN:**

```powershell
flutter run --dart-define=FLUTTER_ENV=development --dart-define=API_BASE_URL=http://192.168.1.10:8080/api
```

### Production (`kienvu.io.vn`)

```powershell
copy dart_defines.prod.example.json dart_defines.prod.json
flutter build apk --release --dart-define-from-file=dart_defines.prod.json
```

Hoặc một dòng:

```powershell
flutter build apk --release `
  --dart-define=FLUTTER_ENV=production `
  --dart-define=API_BASE_URL=https://kienvu.io.vn/api `
  --dart-define=GOOGLE_WEB_CLIENT_ID=xxx.apps.googleusercontent.com
```

## Tính năng đã nối API

| Tính năng | API |
|-----------|-----|
| Catalog cơ sở / phòng | `GET /catalog/*` |
| Occupancy | `GET /bookings/occupancy` |
| Availability | `POST /bookings/check-availability` |
| Checkout | `POST /checkout/pay` + WebView VNPay/MoMo |
| Ví Cherry House | `GET /wallet` |
| Đặt phòng của tôi + hủy | `GET /bookings/me`, cancel preview/cancel |
| Auth | register OTP, login, Google mobile, refresh token |

## Cấu trúc

```
lib/
  config/app_config.dart
  app_services.dart
  api/          — api_client, catalog, booking, checkout, wallet, …
  data/         — catalog_mapper
  screens/      — home, booking, checkout, profile, wallet, …
  auth/
```

## Google Sign-In

- `GOOGLE_WEB_CLIENT_ID` = `GOOGLE_CLIENT_ID` trong `backend/.env`
- Android: thêm OAuth client + SHA-1 (`.\android\gradlew signingReport`)
- API: `POST /api/auth/google/mobile`

## OTP dev

`AUTH_DEBUG_OTP=true` trong `backend/.env` → OTP hiện trên màn hình đăng ký.
