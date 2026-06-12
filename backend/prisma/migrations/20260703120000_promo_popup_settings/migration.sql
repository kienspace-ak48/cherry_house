-- CreateTable
CREATE TABLE `promo_popup_settings` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `is_enabled` BOOLEAN NOT NULL DEFAULT false,
    `selection_mode` VARCHAR(20) NOT NULL DEFAULT 'manual',
    `promo_code_id` INTEGER NULL,
    `discount_type_filter` VARCHAR(20) NOT NULL DEFAULT 'all',
    `title` VARCHAR(255) NOT NULL DEFAULT 'Ưu đãi Cherry House',
    `message` TEXT NULL,
    `cta_label` VARCHAR(80) NOT NULL DEFAULT 'Sao chép mã',
    `delay_sec` INTEGER NOT NULL DEFAULT 2,
    `dismiss_hours` INTEGER NOT NULL DEFAULT 24,
    `show_on_routes_json` TEXT NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `promo_popup_settings` ADD CONSTRAINT `promo_popup_settings_promo_code_id_fkey` FOREIGN KEY (`promo_code_id`) REFERENCES `promo_codes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
