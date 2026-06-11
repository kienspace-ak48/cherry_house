-- CreateTable
CREATE TABLE `home_hero_settings` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `badge_text` VARCHAR(255) NOT NULL,
    `title_line1` VARCHAR(255) NOT NULL,
    `title_line2` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `quick_cities_json` TEXT NOT NULL,
    `slides_json` LONGTEXT NOT NULL,
    `slide_interval_sec` INTEGER NOT NULL DEFAULT 6,
    `is_enabled` BOOLEAN NOT NULL DEFAULT true,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
