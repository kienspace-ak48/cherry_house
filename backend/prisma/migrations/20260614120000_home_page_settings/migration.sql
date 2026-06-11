-- CreateTable
CREATE TABLE `home_page_settings` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `stats_enabled` BOOLEAN NOT NULL DEFAULT true,
    `stats_json` TEXT NOT NULL,
    `why_enabled` BOOLEAN NOT NULL DEFAULT true,
    `why_eyebrow` VARCHAR(120) NOT NULL,
    `why_title` VARCHAR(255) NOT NULL,
    `why_description` TEXT NOT NULL,
    `why_items_json` LONGTEXT NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
