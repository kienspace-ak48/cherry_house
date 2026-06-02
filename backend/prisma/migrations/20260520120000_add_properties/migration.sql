-- CreateTable
CREATE TABLE `properties` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(120) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `city` VARCHAR(120) NOT NULL,
    `region` VARCHAR(120) NOT NULL,
    `kind` ENUM('homestay', 'mini_hotel', 'villa', 'serviced_apartment') NOT NULL,
    `tagline` VARCHAR(500) NULL,
    `description` TEXT NOT NULL,
    `address` VARCHAR(500) NOT NULL,
    `price_from_vnd` INTEGER NOT NULL,
    `room_count` INTEGER NOT NULL DEFAULT 0,
    `branch_count` INTEGER NOT NULL DEFAULT 0,
    `rating` DECIMAL(2, 1) NOT NULL DEFAULT 0,
    `review_count` INTEGER NOT NULL DEFAULT 0,
    `hero_image_url` VARCHAR(500) NULL,
    `highlights` JSON NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `properties_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
