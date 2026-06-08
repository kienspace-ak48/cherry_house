# Cherry House — Mobile (Flutter)

UI mobile + **đăng nhập / đăng ký** (gọi API backend giống React). Catalog booking vẫn dùng fake data.

## Yêu cầu

- Backend chạy tại `http://localhost:8080` (`pnpm dev` trong `backend/`)
- Flutter SDK ^3.12

## Môi trường (`FLUTTER_ENV`)

Giống `VITE_ENV` trên React web:

| Giá trị | Mặc định | API (nếu không set `API_BASE_URL`) |
|---------|----------|-------------------------------------|
| `development` | ✓ khi `flutter run` | `10.0.2.2:8080` (Android) / `localhost:8080` |
| `production` | khi build release | `PROD_API_BASE_URL` hoặc `https://api.cherryhouse.vn/api` |

Trong code: `AppConfig.isDevelopment`, `AppConfig.isProduction`, `AppConfig.envLabel`.

## Chạy dev (Android emulator)

```bash
cd mobile
flutter pub get
flutter run --dart-define=FLUTTER_ENV=development
```

(`development` là mặc định — có thể bỏ qua khi dev.)

**iOS simulator / Windows desktop:**

```bash
flutter run --dart-define=FLUTTER_ENV=development --dart-define=API_BASE_URL=http://localhost:8080/api
```

**Máy thật (cùng WiFi):** thay bằng IP LAN máy dev, ví dụ `http://192.168.1.10:8080/api`.

## Build production

```bash
flutter build apk --release \
  --dart-define=FLUTTER_ENV=production \
  --dart-define=API_BASE_URL=https://api.cherryhouse.vn/api \
  --dart-define=GOOGLE_WEB_CLIENT_ID=xxx.apps.googleusercontent.com
```

## Đăng ký / đăng nhập

| Tính năng | API |
|-----------|-----|
| Gửi OTP | `POST /api/auth/register/send-otp` |
| Xác thực OTP | `POST /api/auth/register/verify-otp` |
| Đăng nhập email | `POST /api/auth/login` |
| Google (mobile) | `POST /api/auth/google/mobile` + `google_sign_in` |
| Profile | `GET /api/auth/me` |

Tab **Tài khoản** → Đăng nhập / Đăng ký khi chưa login.

### File cấu hình (giống `.env`)

Flutter **không có** file `.env` sẵn. Dự án dùng **`dart_defines.dev.json`** (gitignore):

```powershell
cd mobile
copy dart_defines.dev.example.json dart_defines.dev.json
# Mở dart_defines.dev.json — dán GOOGLE_CLIENT_ID từ backend/.env vào GOOGLE_WEB_CLIENT_ID
```

Chạy:

```powershell
.\run_dev.ps1
# hoặc
flutter run --dart-define-from-file=dart_defines.dev.json
```

Trong Cursor/VS Code: chọn launch config **「Flutter (mobile dev)」** (F5).

| Key JSON | Tương đương backend `.env` |
|----------|----------------------------|
| `FLUTTER_ENV` | — (`development` / `production`) |
| `API_BASE_URL` | URL API (dev: `http://10.0.2.2:8080/api`) |
| `GOOGLE_WEB_CLIENT_ID` | **`GOOGLE_CLIENT_ID`** (Web client, không phải secret) |

Đọc trong code: `AppConfig.googleWebClientId`, `AppConfig.apiBaseUrl`.

### Google Sign-In trên Web (Chrome)

Flutter web cần **`clientId`** (không chỉ `serverClientId`). Đã truyền qua `GoogleSignIn(clientId: ...)` khi `kIsWeb`.

- Chạy với `dart_defines.dev.json` (có `GOOGLE_WEB_CLIENT_ID`)
- `web/index.html` có thêm `<meta name="google-signin-client_id" ...>` (cùng Client ID)
- Google Cloud → **Authorized JavaScript origins**: `http://localhost:<port>` (port Flutter web in ra khi run, thường 5xxxx)

API dev trên web: tự dùng `http://localhost:8080/api` (kể cả khi JSON ghi `10.0.2.2`).

### Google Sign-In trên Android

1. **`GOOGLE_WEB_CLIENT_ID`** = đúng `GOOGLE_CLIENT_ID` trong `backend/.env` (loại *Web application*).
2. Google Cloud Console → thêm **OAuth client Android**:
   - Package name: `com.example.mobile` (xem `android/app/build.gradle.kts`)
   - SHA-1 debug:

```powershell
cd mobile\android
.\gradlew signingReport
# copy SHA1 của variant debug
```

3. Backend đang chạy + cùng `GOOGLE_CLIENT_ID` verify `idToken` tại `POST /api/auth/google/mobile`.

Nếu chưa cấu hình Google, vẫn test được **đăng ký/đăng nhập Email + OTP**.

### OTP dev (không cần Gmail)

Backend `.env`: `AUTH_DEBUG_OTP=true` → app hiện OTP trên màn hình sau khi gửi form.

## Cấu trúc auth

```
lib/
  config/app_config.dart
  api/api_client.dart, auth_api.dart
  auth/auth_storage.dart, auth_controller.dart
  screens/auth/login_screen.dart, register_screen.dart, register_email_screen.dart
```

## Luồng màn hình (catalog — fake)

| Tab / màn hình | Tương ứng React |
|----------------|-----------------|
| Trang chủ | `HomePage` |
| Đặt phòng | `PropertyDiscovery` |
| Tài khoản | `ProfilePage` + auth |

## Theme

Primary `#A82E42`, surface `#FCF9F4`, Be Vietnam Pro + Manrope.
