-- User auth: email verified, Google OAuth, registration OTP

ALTER TABLE `users`
  ADD COLUMN `auth_provider` ENUM('local', 'google') NOT NULL DEFAULT 'local' AFTER `membership_tier`,
  ADD COLUMN `google_id` VARCHAR(120) NULL AFTER `auth_provider`,
  ADD COLUMN `email_verified` BOOLEAN NOT NULL DEFAULT false AFTER `google_id`,
  ADD UNIQUE INDEX `users_google_id_key` (`google_id`);

CREATE TABLE `registration_otps` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `otp_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(30) NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME(3) NOT NULL,
  `attempts` INTEGER NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `registration_otps_email_key` (`email`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
