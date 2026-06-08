# 00 — Project Brief: Cherry House

**Phiên bản:** 0.1 (draft)  
**Cập nhật:** 2026-06  
**Trạng thái:** Đang làm việc — các mục `[CHỐT]` cần xác nhận

---

## 1. Tóm tắt một câu

Xây **website đặt phòng trực tiếp** cho chuỗi homestay / mini hotel **Cherry House** (nhiều cơ sở, nhiều chi nhánh, nhiều phòng), thay vì phụ thuộc sàn OTA.

---

## 2. Bối cảnh & vấn đề

### 2.1 Hiện trạng (pain)

| Pain | Mô tả |
|------|--------|
| Phụ thuộc OTA | Hoa hồng cao, không sở hữu dữ liệu khách |
| Vận hành rời rạc | Zalo, Excel, Facebook — dễ trùng phòng, sai giá |
| Thiếu cửa thương hiệu | Khó mở rộng tỉnh mới với trải nghiệm thống nhất |
| Nội dung & ảnh | Cập nhật chậm, không có media library tập trung |

### 2.2 Cơ hội

- Khách Việt quen tìm theo **địa điểm + ngày**, muốn giá minh bạch.
- Chuỗi nhỏ cần **MVP nhanh**: catalog + booking + admin, không cần marketplace.

---

## 3. Mục tiêu

### 3.1 Mục tiêu kinh doanh

- Tăng tỷ lệ đặt phòng **trực tiếp** qua website Cherry House.
- Giảm sai sót tồn phòng nhờ hệ thống booking tập trung.
- Chuẩn hóa hình ảnh & mô tả cơ sở trên toàn chuỗi.

### 3.2 Mục tiêu sản phẩm (MVP)

| # | Mục tiêu | Đo lường gợi ý |
|---|----------|----------------|
| G1 | Khách hoàn tất luồng đặt phòng online | 1 booking end-to-end trên staging |
| G2 | Admin quản lý catalog không cần dev | CRUD property / branch / room |
| G3 | Dữ liệu catalog nhất quán | 1 nguồn DB, không mock ở bước booking |

### 3.3 Không phải mục tiêu (Out of scope MVP)

- Marketplace nhiều thương hiệu.
- Đồng bộ real-time với Booking.com / Agoda (channel manager).
- Đa ngôn ngữ (ngoài tiếng Việt).
- Ứng dụng mobile production (có thể chỉ UI demo trước).

---

## 4. Đối tượng & stakeholder

| Vai trò | Nhu cầu chính |
|---------|----------------|
| **Khách lẻ** | Tìm cơ sở → chọn phòng → đặt nhanh, giá rõ |
| **Khách đã có tài khoản** | Xem lịch sử booking |
| **Host / lễ tân** | Biết phòng trống / đã đặt theo ngày |
| **Admin thương hiệu** | Sửa catalog, ảnh, xem booking |
| **Dev / vận hành** | Một repo, deploy đơn giản |

---

## 5. Phạm vi chức năng (Scope)

### 5.1 In scope — MVP

**Khách (web):**
- Trang chủ + tìm kiếm (địa điểm, ngày, loại hình).
- Danh sách & chi tiết cơ sở.
- Chọn chi nhánh → danh sách phòng → chi tiết phòng.
- Checkout → tạo booking trong DB.
- (P1) Đăng nhập & profile booking.

**Admin (web SSR):**
- CRUD cơ sở, chi nhánh, phòng.
- Media library (upload ảnh).
- Xem danh sách booking, đổi trạng thái cơ bản.

**Hệ thống:**
- MySQL + API REST + auth JWT.
- Seed dữ liệu demo Việt Nam.

### 5.2 Out of scope — giai đoạn sau

- Cổng thanh toán thật (VNPay, MoMo…) — `[CHỐT]` có thể đưa vào MVP nếu go-live sớm.
- Review / rating từ khách.
- Chat / CSKH tích hợp.
- Multi-tenant (nhiều brand).

---

## 6. Mô hình kinh doanh (domain tóm tắt)

```
Cherry House (brand)
 └── Property      — cơ sở theo địa điểm (vd: Đà Lạt)
      └── Branch   — chi nhánh vật lý (vd: Hồ Xuân Hương)
           └── Room — phòng vật lý (vd: HXH-101)
                └── Booking
```

Chi tiết quy tắc → [02-domain-rules.md](./02-domain-rules.md).

---

## 7. Ràng buộc & giả định

| Loại | Nội dung |
|------|----------|
| **Giả định** | Một thương hiệu, một tenant DB |
| **Giả định** | Tiếng Việt, tiền VND |
| **Ràng buộc** | Team nhỏ → ưu tiên monolith, ship MVP |
| **Ràng buộc** | MySQL local/dev; production `[CHỐT]` |
| **Rủi ro** | Mock song song API → technical debt; cần sunset mock sớm |

---

## 8. Kiến trúc sản phẩm (định hướng)

| Kênh | Công nghệ | Ghi chú |
|------|-----------|---------|
| Web khách | React (Vite) + Tailwind | Build → serve từ backend |
| Admin | Express + EJS + CoreUI | SSR, JWT |
| API | Express + Prisma | `/api/catalog` (public read) + CRUD |
| Mobile | Flutter | UI demo → nối API sau |
| DB | MySQL | Prisma migrate |

Chi tiết API → [03-erd-api.md](./03-erd-api.md).

---

## 9. Tiêu chí hoàn thành MVP (Definition of Done)

- [ ] Khách đi **full flow không mock**: tìm → cơ sở → chi nhánh → phòng → checkout → booking trong DB.
- [ ] Không đặt trùng phòng cùng khoảng ngày (rule + kiểm tra server).
- [ ] Admin CRUD được property, branch, room.
- [ ] `GET /api/health` → database connected.
- [ ] README dev: chạy DB, seed, backend, frontend.

---

## 10. Quyết định cần chốt (`[CHỐT]`)

| # | Câu hỏi | Gợi ý mặc định |
|---|---------|----------------|
| Q1 | Giá hiển thị theo phòng hay loại phòng? | Theo **phòng vật lý** (`InventoryRoom.priceVnd`) |
| Q2 | Khách đặt không cần đăng nhập? | **Có** (guest booking); account là P1 |
| Q3 | Giữ phòng tạm khi checkout? | **Có**, 15 phút, status `pending_payment` |
| Q4 | Thanh toán MVP | **Giả lập** paid; gateway = phase sau |
| Q5 | Luồng URL chính | **`/booking`** (properties redirect về đây) |

Ghi quyết định đã chốt vào [02-domain-rules.md](./02-domain-rules.md).

---

## 11. Tài liệu liên quan

- Luồng người dùng → [01-user-flows.md](./01-user-flows.md)
- Backlog → [04-roadmap-backlog.md](./04-roadmap-backlog.md)
