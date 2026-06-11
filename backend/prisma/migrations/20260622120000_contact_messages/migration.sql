-- Contact form messages from website
CREATE TABLE `contact_messages` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(30) NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('new', 'read', 'replied', 'archived') NOT NULL DEFAULT 'new',
  `admin_note` TEXT NULL,
  `read_at` DATETIME(3) NULL,
  `ip_address` VARCHAR(64) NULL,
  `user_agent` VARCHAR(500) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  INDEX `contact_messages_status_idx`(`status`),
  INDEX `contact_messages_created_at_idx`(`created_at`),
  INDEX `contact_messages_email_idx`(`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
