-- media_folders
CREATE TABLE `media_folders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(120) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `media_folders_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- media_images
CREATE TABLE `media_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `folder_id` INTEGER NULL,
    `name` VARCHAR(255) NOT NULL,
    `path` VARCHAR(500) NOT NULL,
    `mime_type` VARCHAR(100) NULL,
    `size_bytes` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `media_images_path_key`(`path`),
    INDEX `media_images_folder_id_idx`(`folder_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `media_images` ADD CONSTRAINT `media_images_folder_id_fkey` FOREIGN KEY (`folder_id`) REFERENCES `media_folders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
