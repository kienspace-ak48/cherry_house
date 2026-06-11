CREATE TABLE `booking_check_ins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` INTEGER NOT NULL,
    `user_id` INTEGER NULL,
    `guest_name` VARCHAR(255) NOT NULL,
    `guest_phone` VARCHAR(30) NOT NULL,
    `guest_email` VARCHAR(255) NOT NULL,
    `booking_code` VARCHAR(40) NOT NULL,
    `property_name` VARCHAR(255) NOT NULL,
    `branch_name` VARCHAR(255) NOT NULL,
    `room_code` VARCHAR(50) NOT NULL,
    `signature_path` VARCHAR(500) NOT NULL,
    `checked_in_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `checked_in_by_admin_id` INTEGER NULL,
    `staff_name` VARCHAR(255) NULL,

    UNIQUE INDEX `booking_check_ins_booking_id_key`(`booking_id`),
    INDEX `booking_check_ins_user_id_idx`(`user_id`),
    INDEX `booking_check_ins_guest_email_idx`(`guest_email`),
    INDEX `booking_check_ins_checked_in_at_idx`(`checked_in_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `booking_check_ins` ADD CONSTRAINT `booking_check_ins_booking_id_fkey`
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `booking_check_ins` ADD CONSTRAINT `booking_check_ins_checked_in_by_admin_id_fkey`
  FOREIGN KEY (`checked_in_by_admin_id`) REFERENCES `admins`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
