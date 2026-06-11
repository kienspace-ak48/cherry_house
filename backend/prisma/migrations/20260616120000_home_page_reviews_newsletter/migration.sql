-- AlterTable
ALTER TABLE `home_page_settings`
    ADD COLUMN `reviews_enabled` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `reviews_eyebrow` VARCHAR(120) NOT NULL DEFAULT 'ĐÁNH GIÁ TỪ KHÁCH THỰC',
    ADD COLUMN `reviews_title` VARCHAR(255) NOT NULL DEFAULT 'Họ đã nói gì về Cherry House?',
    ADD COLUMN `reviews_json` LONGTEXT NULL,
    ADD COLUMN `newsletter_enabled` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `newsletter_title` VARCHAR(255) NOT NULL DEFAULT 'Nhận deal sớm nhất',
    ADD COLUMN `newsletter_description` TEXT NULL,
    ADD COLUMN `newsletter_placeholder` VARCHAR(120) NOT NULL DEFAULT 'Email của bạn',
    ADD COLUMN `newsletter_button_label` VARCHAR(80) NOT NULL DEFAULT 'Đăng ký ngay',
    ADD COLUMN `newsletter_success_message` VARCHAR(255) NOT NULL DEFAULT 'Cảm ơn bạn! Cherry House sẽ gửi ưu đãi vào email của bạn.';

UPDATE `home_page_settings`
SET
    `reviews_json` = COALESCE(`reviews_json`, '[]'),
    `newsletter_description` = COALESCE(
        `newsletter_description`,
        'Giá ưu đãi và phòng trống mới nhất gửi thẳng vào hộp thư — mỗi tuần một lần, không spam.'
    )
WHERE `id` = 1;

ALTER TABLE `home_page_settings`
    MODIFY `reviews_json` LONGTEXT NOT NULL,
    MODIFY `newsletter_description` TEXT NOT NULL;
