# 05 — Seed test data

Bộ dữ liệu mẫu chạy bằng `pnpm run db:seed` trong thư mục `backend`.

Nguồn: `backend/prisma/seed.js` + `backend/prisma/seed-data/test-catalog.js`.

---

## Tổng quan

| Nhóm | Số lượng | Ghi chú |
|------|----------|---------|
| Cơ sở (`properties`) | **4** | 3 Đà Lạt + 1 Hà Nội |
| Chi nhánh (`branches`) | **6** | 1–2 chi nhánh/cơ sở |
| Phòng (`rooms`) | **55** | 10–20 phòng/cơ sở, giá VN |
| Loại phòng (`room_types`) | **4** | Standard / Deluxe / Suite / Penthouse |
| Booking (`bookings`) | **6** | Đủ trạng thái chính |
| User (`users`) | **6** | Tier, ban, OAuth, inactive |
| Admin (`admins`) | **4** | super_admin, admin, staff scoped |
| Promo (`promo_codes`) | **5** | Active, hết hạn, tắt, gần hết lượt |
| Contact (`contact_messages`) | **4** | new / read / replied / archived |

`room_count` và `branch_count` **tự đồng bộ** sau seed (đếm từ DB thật).

---

## 1. Cơ sở & chi nhánh

### Đà Lạt (3 cơ sở)

| Slug | Tên | Kind | Active | Chi nhánh | Phòng |
|------|-----|------|--------|-----------|-------|
| `cherry-dalat-centro` | Cherry House Đà Lạt Centro | homestay | ✅ | 2 (`dl-centro-hxh`, `dl-centro-night`) | 14 |
| `cherry-dalat-pine-retreat` | Cherry Pine Retreat | homestay | ❌ | 1 (`dl-pine-main`) | 12 |
| `cherry-dalat-skyline` | Cherry Skyline | mini_hotel | ✅ | 2 (`dl-sky-valley`, `dl-sky-urban`*) | 18 |

\* Chi nhánh `dl-sky-urban` **inactive** — test filter chi nhánh tắt.

### Hà Nội (1 cơ sở)

| Slug | Tên | Kind | Chi nhánh | Phòng |
|------|-----|------|-----------|-------|
| `cherry-house-ha-noi` | Cherry House Hà Nội | serviced_apartment | 1 (`hn-hoankiem`) | 11 |

**Giá tham chiếu (VND/đêm):**

- Homestay Đà Lạt: 750k – 1.2M  
- Mini hotel Đà Lạt: 980k – 1.5M  
- Căn hộ Hà Nội: 850k – 1.3M  
- Suite / Penthouse: 1.45M – 2.8M+

Mỗi chi nhánh có `branch_map_pins` (tọa độ Google Maps).

---

## 2. Phòng (`rooms`)

Sinh tự động trong `test-catalog.js` → `generateInventoryRooms()`.

**Case được cover:**

| Case | Ví dụ |
|------|--------|
| `status: available` | Đa số phòng |
| `status: pending` | Mỗi ~7 phòng (đang giữ) |
| `status: booked` | Mỗi ~11 phòng |
| `isActive: false` | 1 phòng cuối ở Skyline Valley |
| Gallery đầy đủ | `HXH-101` (Centro) |
| `extraParagraphs` | `HXH-101` |
| 4 `room_type` | standard-garden, deluxe-pine, suite-horizon, penthouse-sky |
| `penthouse-sky` inactive | Loại phòng tắt trong catalog |

---

## 3. Tiện nghi & gallery

| Bảng | Case |
|------|------|
| `amenities` | 7 icon (wifi, parking, breakfast, ac, pool, kitchen, workspace) |
| `property_amenities` | Khác nhau theo từng cơ sở |
| `room_type_amenities` | Khác nhau theo loại phòng |
| `property_gallery` | 3 ảnh/cơ sở |
| `room_type_gallery` | 3 ảnh/loại phòng |

---

## 4. Tài khoản

### Admin (`admins`)

| Email | Role | Scope |
|-------|------|-------|
| `admin@cherryhouse.vn` | super_admin | Toàn hệ thống |
| `manager@cherryhouse.vn` | admin | Toàn hệ thống |
| `staff.dalat@cherryhouse.vn` | staff | Cơ sở Centro + chi nhánh HXH |
| `staff.hanoi@cherryhouse.vn` | staff | Cơ sở Hà Nội |

Mật khẩu admin: `Admin@123` · staff: `Staff@123`

### Khách (`users`)

| Email | Case |
|-------|------|
| `guest@cherryhouse.vn` | Gold, verified, active |
| `standard@test.vn` | Standard tier |
| `diamond@test.vn` | Diamond tier |
| `banned@test.vn` | `bookingBanned: true` + lý do |
| `inactive@test.vn` | `isActive: false` |
| `google.user@test.vn` | `authProvider: google`, không password |

Mật khẩu user local: `Test@123`

---

## 5. Booking & thanh toán

| Mã | Status | Payment | Ghi chú |
|----|--------|---------|---------|
| `CH-SEED-001` | confirmed | momo / paid | Có user, promo CHERRY10 |
| `CH-SEED-002` | pending_payment | bank / pending | Guest walk-in |
| `CH-SEED-003` | checked_in | card / paid | Skyline Valley |
| `CH-SEED-004` | completed | wallet / paid | Hà Nội |
| `CH-SEED-005` | cancelled | — | Không payment |
| `CH-SEED-006` | no_show | momo / paid | Walk-in |

---

## 6. Promo codes

| Code | Case |
|------|------|
| `CHERRY10` | Percent 10%, đang dùng |
| `SAVE100K` | Fixed 100k, min 500k |
| `DALAT20` | `usedCount` gần `maxUses` (199/200) |
| `EXPIRED50` | `validTo` đã qua |
| `DISABLED` | `isActive: false` |

---

## 7. Contact messages

| Status | Mô tả |
|--------|--------|
| `new` | Tin chưa đọc |
| `read` | Đã mở, email trùng user guest |
| `replied` | Có `adminNote` |
| `archived` | Spam đã lưu trữ |

---

## 8. CMS & singleton

| Bảng | id | Case |
|------|-----|------|
| `seo_global_settings` | 1 | Site URL từ `CLIENT_APP_URL` |
| `seo_page_templates` | — | home, properties, contact |
| `home_hero_settings` | 1 | Default slides |
| `home_page_settings` | 1 | Stats, areas, reviews… |
| `chat_bot_settings` | 1 | Prompt mặc định |
| `email_templates` | — | 4 template (booking, OTP, promo, marketing) |
| `media_folders` | hero, rooms | 2 folder + ảnh mẫu |

---

## 9. Dọn dữ liệu cũ khi seed

Seed **xóa trước khi tạo lại:**

- `payments`, `bookings`, `contact_messages`
- Các cơ sở trong `LEGACY_PROPERTY_SLUGS` (catalog 10 tỉnh cũ)
- 4 cơ sở test (upsert sạch qua delete + create)

**Không xóa:** `room_types`, `amenities`, `users`, `admins`, `promo_codes` (upsert).

---

## Chạy seed

```bash
cd backend
pnpm run db:seed
```

Sau seed, kiểm tra nhanh:

- Admin: `http://localhost:8080/admin/properties`
- API catalog: `GET /api/properties`
- Đà Lạt: 3 cơ sở, tổng 44 phòng
- Hà Nội: 1 cơ sở, 11 phòng
