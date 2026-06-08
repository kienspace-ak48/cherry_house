# 04 — Roadmap & Backlog

Lộ trình triển khai theo **phase**, backlog ưu tiên, và checklist nghiệm thu.  
Cập nhật trạng thái khi hoàn thành: `[ ]` → `[x]`.

---

## 1. Tổng quan phase

| Phase | Mục tiêu | Thời lượng gợi ý |
|-------|----------|------------------|
| **0** | Chốt tài liệu & quyết định `[CHỐT]` | 3–5 ngày |
| **1** | Nền + catalog + admin CRUD | 2–3 tuần |
| **2** | Booking end-to-end | 2 tuần |
| **3** | Auth khách, media, polish | 2 tuần |
| **4** | Mobile API + production | 2+ tuần |

---

## 2. Phase 0 — Chuẩn bị (không code feature mới)

### Deliverable

- [x] Bộ docs `docs/00` → `04`
- [ ] Họp chốt Q1–Q5 trong [00-project-brief.md](./00-project-brief.md)
- [ ] Điền bảng quyết định trong [02-domain-rules.md](./02-domain-rules.md)
- [ ] Wireframe 8 màn (Figma hoặc ảnh) — link vào [01-user-flows.md](./01-user-flows.md)
- [ ] Môi trường: MySQL chạy ổn, `.env`, `db:seed` OK

### Exit criteria

Mọi dev đọc xong brief + domain rules và **cùng hiểu** luồng booking A→Z.

---

## 3. Phase 1 — Catalog & Admin

### P0 — Bắt buộc

| ID | Story | Acceptance criteria | Trạng thái |
|----|-------|---------------------|------------|
| P1-01 | Seed catalog VN | ≥ 5 properties, mỗi property ≥ 1 branch, ≥ 1 room | [x] |
| P1-02 | API catalog properties | `GET /catalog/properties` filter city/kind | [x] |
| P1-03 | API catalog detail | Slug trả branches, gallery | [x] |
| P1-04 | API catalog rooms | Filter propertySlug + branchCode | [x] |
| P1-05 | React: discovery | `/booking` list từ API, không mock list | [x] |
| P1-06 | React: property + branch | Load property by slug, chọn branch | [~] một phần |
| P1-07 | React: room list | `roomApi` thay `bookingData` | [~] một phần |
| P1-08 | Admin CRUD property | Create/edit/delete | [x] |
| P1-09 | Admin CRUD branch | Gắn property | [x] |
| P1-10 | Admin CRUD room | Gắn branch + room type | [x] |
| P1-11 | Admin gallery | Upload, folder, xóa | [x] |
| P1-12 | Health + DB error | `/api/health`, message 503 rõ | [x] |

`[~]` = đang làm / còn mock ở nhánh phụ.

### P1 — Nên có

| ID | Story | Trạng thái |
|----|-------|------------|
| P1-13 | Sunset `bookingData.js` mock | [ ] |
| P1-14 | Sunset `properties.js` ở luồng booking | [ ] |
| P1-15 | Map pin trên branch (Leaflet) | [ ] |

### Exit criteria Phase 1

- Demo: tìm Đà Lạt → thấy cơ sở từ DB → xem phòng từ API (Đà Lạt / HXH).
- Admin thêm property mới → hiện trên web sau reload.

---

## 4. Phase 2 — Booking end-to-end

### P0

| ID | Story | Acceptance criteria | Trạng thái |
|----|-------|---------------------|------------|
| P2-01 | POST booking | Tạo record, `pending_payment`, snapshot giá | [ ] |
| P2-02 | Overlap check | DR-11: từ chối trùng ngày | [ ] |
| P2-03 | POST payment (mock) | `paid` → booking `confirmed` | [ ] |
| P2-04 | React checkout | Form → POST booking, không `MOCK_ROOMS` | [ ] |
| P2-05 | Màn success | Hiển thị `bookingCode` | [ ] |
| P2-06 | Admin bookings | List + filter status | [ ] |
| P2-07 | Hold expiry | Cancel `pending_payment` quá hạn `[CHỐT]` | [ ] |

### Exit criteria Phase 2

- 1 booking hoàn chỉnh trên staging, kiểm tra DB có row `bookings` + `payments`.
- Đặt thử 2 lần cùng phòng cùng ngày → lần 2 fail 409.

---

## 5. Phase 3 — Auth, profile, media polish

| ID | Story | Trạng thái |
|----|-------|------------|
| P3-01 | Đăng ký / đăng nhập khách (React) | [ ] |
| P3-02 | Profile: GET bookings by user | [ ] |
| P3-03 | Availability filter checkIn/checkOut | [ ] |
| P3-04 | Gallery picker trong admin form | [ ] |
| P3-05 | Email xác nhận booking | [ ] |
| P3-06 | Promo code apply | [ ] |

---

## 6. Phase 4 — Mobile & Production

| ID | Story | Trạng thái |
|----|-------|------------|
| P4-01 | Flutter: API service catalog | [ ] |
| P4-02 | Flutter: booking flow nối API | [ ] |
| P4-03 | Build frontend → `backend/client` | [ ] |
| P4-04 | Deploy single server + MySQL prod | [ ] |
| P4-05 | Payment gateway thật | [ ] |
| P4-06 | Monitoring / backup DB | [ ] |

---

## 7. Backlog kỹ thuật (transversal)

| ID | Task | Ưu tiên |
|----|------|---------|
| T-01 | Xóa mock files hoặc gắn nhãn `@deprecated` | P0 |
| T-02 | Test overlap booking (integration) | P0 |
| T-03 | Chuẩn hóa `sendApiError` mọi controller | P1 |
| T-04 | OpenAPI / Swagger từ catalog routes | P2 |
| T-05 | Docker compose (mysql + app) | P2 |

---

## 8. Definition of Done — MVP (copy từ brief)

- [ ] Full flow khách **không mock** đến booking DB
- [ ] Không overlap phòng cùng ngày
- [ ] Admin CRUD property / branch / room
- [ ] Health check DB
- [ ] README dev đủ chạy local

---

## 9. Sprint gợi ý (2 tuần / sprint)

### Sprint 1 (hiện tại → tiếp)

**Goal:** Đóng Phase 1 — bỏ mock ở booking flow.

- P1-13, P1-14, P1-06, P1-07
- Demo nội bộ

### Sprint 2

**Goal:** Phase 2 booking.

- P2-01 → P2-05
- Test overlap

### Sprint 3

**Goal:** Admin booking + Phase 3 auth.

- P2-06, P3-01, P3-02

---

## 10. Ghi chú tiến độ

| Ngày | Ghi chú |
|------|---------|
| 2026-06 | Khởi tạo bộ docs; catalog API + admin CRUD + gallery đã có; React discovery nối API; checkout vẫn mock |

*Cập nhật dòng này sau mỗi sprint.*
