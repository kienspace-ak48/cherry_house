-- Admin staff role + gắn chi nhánh cho nhân viên

ALTER TABLE `admins` MODIFY `role` ENUM('admin', 'super_admin', 'staff') NOT NULL DEFAULT 'admin';

ALTER TABLE `admins` ADD COLUMN `branch_id` INTEGER NULL;

CREATE INDEX `admins_branch_id_idx` ON `admins`(`branch_id`);

ALTER TABLE `admins` ADD CONSTRAINT `admins_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
