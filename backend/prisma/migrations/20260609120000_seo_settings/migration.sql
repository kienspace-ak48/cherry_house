-- CreateTable
CREATE TABLE `seo_global_settings` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `site_name` VARCHAR(120) NOT NULL,
    `site_url` VARCHAR(500) NOT NULL,
    `default_title` VARCHAR(255) NOT NULL,
    `default_description` TEXT NOT NULL,
    `default_keywords` VARCHAR(500) NULL,
    `og_image_url` VARCHAR(500) NULL,
    `twitter_site` VARCHAR(120) NULL,
    `theme_color` VARCHAR(20) NULL,
    `organization_name` VARCHAR(255) NULL,
    `organization_description` TEXT NULL,
    `organization_phone` VARCHAR(30) NULL,
    `organization_email` VARCHAR(255) NULL,
    `organization_address` VARCHAR(500) NULL,
    `allow_indexing` BOOLEAN NOT NULL DEFAULT true,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seo_page_templates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `page_key` VARCHAR(60) NOT NULL,
    `label` VARCHAR(120) NOT NULL,
    `title_template` VARCHAR(255) NOT NULL,
    `description_template` TEXT NOT NULL,
    `keywords_template` VARCHAR(500) NULL,
    `robots` VARCHAR(40) NOT NULL DEFAULT 'index, follow',
    `og_image_url` VARCHAR(500) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `seo_page_templates_page_key_key`(`page_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
