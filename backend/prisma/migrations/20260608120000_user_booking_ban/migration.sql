-- Cấm đặt phòng (vi phạm / blacklist) — tách khỏi isActive (vẫn đăng nhập được)

ALTER TABLE `users`
  ADD COLUMN `booking_banned` BOOLEAN NOT NULL DEFAULT false AFTER `is_active`,
  ADD COLUMN `booking_ban_reason` TEXT NULL AFTER `booking_banned`,
  ADD COLUMN `booking_banned_at` DATETIME(3) NULL AFTER `booking_ban_reason`;
