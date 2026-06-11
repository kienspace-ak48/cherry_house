-- Admin CMS avatar (gallery)
ALTER TABLE `admins` ADD COLUMN `avatar_url` VARCHAR(500) NULL AFTER `full_name`;
