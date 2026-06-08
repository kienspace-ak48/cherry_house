# 03 — ERD & API Contract

Mô hình dữ liệu logic và hợp đồng API **mục tiêu** (đã align với schema Prisma hiện tại, có thể tinh chỉnh).

---

## 1. Sơ đồ quan hệ (ERD)

```mermaid
erDiagram
  Property ||--o{ Branch : has
  Property ||--o{ PropertyGallery : has
  Property ||--o{ PropertyAmenity : has
  Branch ||--o| BranchMapPin : has
  Branch ||--o{ InventoryRoom : has
  RoomType ||--o{ InventoryRoom : template
  InventoryRoom ||--o{ Booking : has
  Property ||--o{ Booking : snapshot
  Branch ||--o{ Booking : snapshot
  User ||--o{ Booking : optional
  Booking ||--o| Payment : has
  Amenity ||--o{ PropertyAmenity : linked
  MediaFolder ||--o{ MediaImage : contains

  Property {
    int id PK
    string slug UK
    string city
    enum kind
    int priceFromVnd
    bool isActive
  }
  Branch {
    int id PK
    int propertyId FK
    string code
    string name
  }
  InventoryRoom {
    int id PK
    int branchId FK
    int roomTypeId FK
    string code
    int priceVnd
    enum status
  }
  Booking {
    int id PK
    string bookingCode UK
    int roomId FK
    date checkIn
    date checkOut
    enum status
  }
  Payment {
    int id PK
    int bookingId FK UK
    enum status
  }
```

---

## 2. Bảng chính (tóm tắt)

| Bảng | Vai trò |
|------|---------|
| `properties` | Cơ sở lưu trú |
| `branches` | Chi nhánh |
| `branch_map_pins` | Tọa độ bản đồ |
| `room_types` | Mẫu phòng |
| `rooms` | Phòng vật lý (inventory) |
| `property_gallery` | Ảnh cơ sở |
| `amenities` + junction | Tiện nghi |
| `bookings` | Đặt phòng |
| `payments` | Thanh toán |
| `users` | Tài khoản |
| `promo_codes` | Mã giảm giá |
| `media_folders` / `media_images` | Thư viện admin |

Schema đầy đủ: `backend/prisma/schema.prisma`.

---

## 3. Enum quan trọng

| Enum | Values |
|------|--------|
| `PropertyKind` | homestay, mini_hotel, villa, serviced_apartment |
| `InventoryRoomStatus` | available, pending, booked |
| `BookingStatus` | draft, pending_payment, confirmed, cancelled, completed, no_show |
| `PaymentStatus` | pending, paid, failed, refunded |
| `UserRole` | user, admin, super_admin |

---

## 4. API — Public catalog (React khách)

**Base:** `/api/catalog`  
**Auth:** Không (read-only, `isActive = true`)

### 4.1 Properties

| Method | Path | Query | Response `data` |
|--------|------|-------|-----------------|
| GET | `/properties` | `city`, `kind`, `isActive` | `Property[]` (kèm `subBranches` lightweight) |
| GET | `/properties/slug/:slug` | — | `Property` + gallery, amenities, branches |
| GET | `/properties/:id` | — | `Property` |
| GET | `/properties/:id/branches` | `isActive` | `Branch[]` |

**Property object (rút gọn):**

```json
{
  "id": 1,
  "slug": "cherry-house-da-lat",
  "name": "Cherry House Đà Lạt",
  "city": "Đà Lạt",
  "kind": "homestay",
  "kindLabel": "Homestay",
  "priceFromVnd": 890000,
  "branchCount": 3,
  "roomCount": 42,
  "rating": 4.8,
  "heroImage": "https://...",
  "subBranches": [{ "id": "dl-hxh", "name": "...", "code": "dl-hxh" }]
}
```

### 4.2 Branches & Rooms

| Method | Path | Query | Response |
|--------|------|-------|----------|
| GET | `/branches` | `propertyId` | `Branch[]` |
| GET | `/branches/:id` | — | `Branch` |
| GET | `/branches/:branchId/rooms` | `status`, `isActive` | `Room[]` |
| GET | `/rooms` | `propertySlug`, `branchCode`, `status` | `Room[]` |
| GET | `/rooms/:id` | — | `Room` |

**Room object (rút gọn):**

```json
{
  "id": 1,
  "code": "HXH-101",
  "propertySlug": "cherry-house-da-lat",
  "branchId": "dl-hxh",
  "type": "Standard",
  "status": "available",
  "priceVnd": 890000,
  "capacityLabel": "2 người lớn",
  "image": "https://..."
}
```

### 4.3 Health

| Method | Path | Response |
|--------|------|----------|
| GET | `/api/health` | `{ success, database: "connected" \| "disconnected" }` |

---

## 5. API — Booking & Payment (MVP cần implement đủ)

**Base:** `/api/bookings`, `/api/payments`  
**Auth:** `[CHỐT]` public guest hoặc JWT optional

### 5.1 Tạo booking

`POST /api/bookings`

**Request:**

```json
{
  "roomId": 1,
  "checkIn": "2026-07-01",
  "checkOut": "2026-07-03",
  "adults": 2,
  "children": 0,
  "guestName": "Nguyễn Văn A",
  "guestPhone": "0901234567",
  "guestEmail": "a@email.com",
  "specialNote": "",
  "promoCode": null
}
```

**Validation server:**

- Room tồn tại, `isActive`.
- Không overlap booking active (DR-11).
- Tính `nights`, `subtotalVnd`, `totalVnd` (DR-30).
- Sinh `bookingCode`, `status = pending_payment`.

**Response 201:**

```json
{
  "success": true,
  "data": {
    "id": 10,
    "bookingCode": "CH-20260701-A1B2",
    "status": "pending_payment",
    "totalVnd": 1780000,
    "holdExpiresAt": "2026-06-01T12:15:00Z"
  }
}
```

### 5.2 Thanh toán

`POST /api/payments`

```json
{
  "bookingId": 10,
  "method": "bank"
}
```

MVP: trả `status: paid` → cập nhật booking `confirmed`.

### 5.3 Danh sách booking (P1)

`GET /api/bookings?userId=` — cần JWT.

---

## 6. API — Admin CRUD (tham chiếu)

| Resource | Base path |
|----------|-----------|
| Properties | `/api/properties` |
| Branches | `/api/branches` |
| Rooms | `/api/rooms` |
| Room types | `/api/room-types` |
| Users | `/api/users` |

Admin UI SSR: `/admin/properties`, `/admin/branches`, `/admin/rooms`, `/admin/gallery`.

---

## 7. Admin Gallery API

| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/admin/gallery` | Trang EJS |
| GET | `/admin/gallery/images?folder=` | JSON images |
| GET | `/admin/gallery/folders` | JSON folders |
| POST | `/admin/gallery/category/create` | Tạo folder |
| POST | `/admin/gallery/image-upload-ajax` | Upload (multipart) |
| DELETE | `/admin/gallery/folder-delete` | Xóa folder |
| DELETE | `/admin/gallery/image-delete-ajax` | Xóa ảnh |

Static files: `GET /uploads/gallery/...`

---

## 8. Lỗi chuẩn

| HTTP | `code` | Khi nào |
|------|--------|---------|
| 400 | — | Validation |
| 401 | — | Unauthorized |
| 404 | — | Not found |
| 409 | — | Duplicate booking / unique |
| 503 | `DB_UNAVAILABLE` | MySQL không kết nối |

---

## 9. Môi trường dev

| Service | URL |
|---------|-----|
| Backend | `http://localhost:8080` |
| Frontend dev | `http://localhost:5173` (proxy `/api` → 8080) |
| API base (frontend) | `VITE_API_URL=http://localhost:8080/api` |

---

## 10. Open questions (API)

- [ ] `GET /catalog/rooms` filter theo `checkIn`/`checkOut` — query shape?
- [ ] Pagination catalog khi > 50 properties?
- [ ] Rate limit public API?
