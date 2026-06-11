-- AlterTable (nullable first — backfill — then tighten)
ALTER TABLE `home_page_settings`
    ADD COLUMN `areas_enabled` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `areas_eyebrow` VARCHAR(120) NOT NULL DEFAULT 'KHÁM PHÁ',
    ADD COLUMN `areas_title` VARCHAR(255) NOT NULL DEFAULT 'Khu vực phổ biến',
    ADD COLUMN `areas_see_all_label` VARCHAR(80) NOT NULL DEFAULT 'Xem tất cả',
    ADD COLUMN `areas_see_all_href` VARCHAR(500) NOT NULL DEFAULT '/booking',
    ADD COLUMN `areas_json` LONGTEXT NULL,
    ADD COLUMN `kinds_enabled` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `kinds_eyebrow` VARCHAR(120) NOT NULL DEFAULT 'LOẠI HÌNH',
    ADD COLUMN `kinds_title` VARCHAR(255) NOT NULL DEFAULT 'Chọn kiểu lưu trú phù hợp',
    ADD COLUMN `kinds_description` TEXT NULL,
    ADD COLUMN `kinds_json` LONGTEXT NULL;

UPDATE `home_page_settings`
SET
    `areas_json` = COALESCE(`areas_json`, '[]'),
    `kinds_description` = COALESCE(`kinds_description`, 'Từ homestay ấm cúng đến villa riêng tư — đặt theo đúng nhu cầu.'),
    `kinds_json` = COALESCE(`kinds_json`, '[]')
WHERE `id` = 1;

ALTER TABLE `home_page_settings`
    MODIFY `areas_json` LONGTEXT NOT NULL,
    MODIFY `kinds_description` TEXT NOT NULL,
    MODIFY `kinds_json` LONGTEXT NOT NULL;
