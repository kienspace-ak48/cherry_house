-- Staff gắn cơ sở (property) + trạng thái checked_in

ALTER TABLE `admins` ADD COLUMN `property_id` INTEGER NULL;

ALTER TABLE `admins` ADD CONSTRAINT `admins_property_id_fkey`
  FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX `admins_property_id_idx` ON `admins`(`property_id`);

UPDATE `admins` a
INNER JOIN `branches` b ON a.`branch_id` = b.`id`
SET a.`property_id` = b.`property_id`
WHERE a.`role` = 'staff' AND a.`property_id` IS NULL;

ALTER TABLE `bookings` MODIFY `status` ENUM(
  'draft',
  'pending_payment',
  'confirmed',
  'checked_in',
  'cancelled',
  'completed',
  'no_show'
) NOT NULL DEFAULT 'pending_payment';
