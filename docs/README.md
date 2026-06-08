# Cherry House — Tài liệu dự án

Bộ tài liệu **trước / trong** triển khai. Đọc theo thứ tự khi onboard hoặc trước khi mở feature mới.

| # | File | Mục đích |
|---|------|----------|
| 1 | [00-project-brief.md](./00-project-brief.md) | Vấn đề, mục tiêu, phạm vi, stakeholder |
| 2 | [01-user-flows.md](./01-user-flows.md) | Luồng khách & admin |
| 3 | [02-domain-rules.md](./02-domain-rules.md) | Quy tắc nghiệp vụ (booking, giá, trạng thái) |
| 4 | [03-erd-api.md](./03-erd-api.md) | Mô hình dữ liệu & hợp đồng API |
| 5 | [04-roadmap-backlog.md](./04-roadmap-backlog.md) | Lộ trình phase, backlog P0/P1, DoD MVP |

## Cách dùng

1. **Trước khi code feature mới** — đối chiếu `02-domain-rules` + `03-erd-api`.
2. **Khi tranh luận scope** — mở `00-project-brief` (mục *Out of scope*).
3. **Khi chia việc sprint** — lấy item từ `04-roadmap-backlog`.
4. **Khi thiết kế UI** — bám `01-user-flows`.

> Các mục đánh dấu `[CHỐT]` cần product/owner xác nhận trước khi implement.
