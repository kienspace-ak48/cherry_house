-- Tách admin khỏi users + refresh tokens

CREATE TABLE `admins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'super_admin') NOT NULL DEFAULT 'admin',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admins_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `refresh_tokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token_hash` VARCHAR(64) NOT NULL,
    `subject_type` ENUM('client', 'admin') NOT NULL,
    `user_id` INTEGER NULL,
    `admin_id` INTEGER NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `revoked_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `refresh_tokens_token_hash_key`(`token_hash`),
    INDEX `refresh_tokens_user_id_idx`(`user_id`),
    INDEX `refresh_tokens_admin_id_idx`(`admin_id`),
    INDEX `refresh_tokens_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Chuyển tài khoản admin từ users sang admins (nếu có)
INSERT INTO `admins` (`email`, `password_hash`, `full_name`, `role`, `is_active`, `created_at`, `updated_at`)
SELECT
    `email`,
    COALESCE(`password_hash`, ''),
    `full_name`,
    CASE WHEN `role` = 'super_admin' THEN 'super_admin' ELSE 'admin' END,
    `is_active`,
    `created_at`,
    `updated_at`
FROM `users`
WHERE `role` IN ('admin', 'super_admin') AND `password_hash` IS NOT NULL;

DELETE FROM `users` WHERE `role` IN ('admin', 'super_admin');

ALTER TABLE `users` DROP COLUMN `role`;

ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
