CREATE TABLE `email_templates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `template_key` VARCHAR(60) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `description` TEXT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `config_json` LONGTEXT NOT NULL,
    `is_enabled` BOOLEAN NOT NULL DEFAULT true,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `email_templates_template_key_key`(`template_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
