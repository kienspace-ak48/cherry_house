-- CreateTable
CREATE TABLE `chat_bot_settings` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `assistant_name` VARCHAR(120) NOT NULL,
    `welcome_message` TEXT NOT NULL,
    `system_prompt` LONGTEXT NOT NULL,
    `is_enabled` BOOLEAN NOT NULL DEFAULT true,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
