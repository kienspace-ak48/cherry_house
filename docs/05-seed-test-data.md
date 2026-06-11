# 05 — Seed test data

Bộ dữ liệu mẫu: `pnpm run db:seed` trong `backend`.

Nguồn: `backend/prisma/seed.js` + `backend/prisma/seed-data/test-catalog.js`.

---

## Tổng quan

| Nhóm | Số lượng | Ghi chú |
|------|----------|---------|
| Cơ sở (`properties`) | **4** | Mỗi tỉnh/thành **1 cơ sở** |
| Chi nhánh (`branches`) | **7** | 1–2 chi nhánh/cơ sở, địa chỉ thật + Google Maps |
| Phòng (`rooms`) | **51** | 10–15 phòng/cơ sở |
| Booking (`bookings`) | **10** | 6 tháng 5 + 4 tháng 6 |
| Contact (`contact_messages`) | **5** | Gồm tin tháng 5 |

---

## 1. Cơ sở (mỗi địa phương 1 cơ sở)

| Slug | Thành phố | Kind | Chi nhánh | Phòng |
|------|-----------|------|-----------|-------|
| `cherry-house-da-lat` | Đà Lạt | homestay | 2 | 15 |
| `cherry-house-ha-noi` | Hà Nội | serviced_apartment | 2* | 12 |
| `cherry-house-sapa` | Sa Pa | homestay | 2 | 14 |
| `cherry-villa-vung-tau` | Vũng Tàu | villa | 1 | 10 |

\* Chi nhánh `hn-th` (Tây Hồ) **inactive**.

### Địa chỉ map pin (thật)

| Chi nhánh | Địa chỉ |
|-----------|---------|
| `dl-hxh` | 01 Trần Phú, P.1, Đà Lạt |
| `dl-dt` | 192 Huỳnh Thúc Kháng, P.10, Đà Lạt |
| `hn-hk` | 15 Hàng Gai, Hoàn Kiếm, Hà Nội |
| `hn-th` | 6 Xuân Diệu, Tây Hồ, Hà Nội |
| `sp-cm` | 33 Cầu Mây, TT. Sa Pa |
| `sp-fan` | 51 Fansipan, TT. Sa Pa |
| `vt-sea` | 118 Thùy Vân, P.8, Vũng Tàu |

`google_maps_url` dùng search theo địa chỉ đầy đủ (mở đúng vị trí trên Google Maps).

---

## 2. Booking theo thời gian

### Tháng 5/2026 (lịch sử)

| Mã | Cơ sở | Status | Payment |
|----|-------|--------|---------|
| CH-SEED-001 | Đà Lạt | completed | momo / paid |
| CH-SEED-002 | Sa Pa | completed | card / paid |
| CH-SEED-003 | Vũng Tàu | completed | bank / paid + SAVE100K |
| CH-SEED-004 | Hà Nội | no_show | momo / paid |
| CH-SEED-005 | Sa Pa | cancelled | — |
| CH-SEED-006 | Đà Lạt | completed | wallet / **refunded** |

### Tháng 6/2026 (hiện tại)

| Mã | Status |
|----|--------|
| CH-SEED-007 | confirmed + CHERRY10 |
| CH-SEED-008 | pending_payment |
| CH-SEED-009 | checked_in (Vũng Tàu) |
| CH-SEED-010 | draft |

---

## 3. Contact messages

- 1 tin **mới** (6/2026)
- 3 tin **tháng 5** (read / replied)
- 1 tin **archived** (5/2026)

---

## 4. Tài khoản test

| Email | Vai trò |
|-------|---------|
| `admin@cherryhouse.vn` | super_admin |
| `staff.dalat@cherryhouse.vn` | staff — Đà Lạt |
| `staff.sapa@cherryhouse.vn` | staff — Sa Pa |
| `guest@cherryhouse.vn` | user gold |

Mật khẩu: xem bảng đầy đủ trong file seed hoặc chạy seed rồi đăng nhập thử.

---

## Chạy seed

```bash
cd backend
pnpm run db:reset   # chỉ xóa dữ liệu (catalog + booking + contact…)
pnpm run db:seed    # reset rồi seed lại (mặc định)
```

`db:seed` tự gọi `reset-data.js` trước — không cần chạy `db:reset` riêng trừ khi muốn xóa mà không seed.
