-- Drop legacy demo tables
DROP TABLE IF EXISTS `galleries`;
DROP TABLE IF EXISTS `Room`;

-- property_gallery
CREATE TABLE `property_gallery` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `property_id` INTEGER NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `property_gallery_property_id_idx`(`property_id`),
    CONSTRAINT `property_gallery_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- branch_map_pins
CREATE TABLE `branch_map_pins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branch_id` INTEGER NOT NULL,
    `lat` DECIMAL(10, 7) NOT NULL,
    `lng` DECIMAL(10, 7) NOT NULL,
    `zoom` INTEGER NOT NULL DEFAULT 15,
    `label` VARCHAR(120) NULL,
    `pin_badge` VARCHAR(50) NULL,
    `pin_info` VARCHAR(200) NULL,
    `google_maps_url` VARCHAR(500) NOT NULL,
    `embed_url` VARCHAR(500) NULL,
    UNIQUE INDEX `branch_map_pins_branch_id_key`(`branch_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `branch_map_pins_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- room_types
CREATE TABLE `room_types` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(120) NOT NULL,
    `badge` VARCHAR(120) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `category` ENUM('Standard', 'Deluxe', 'Suite', 'Penthouse') NOT NULL,
    `area_sqm` INTEGER NOT NULL,
    `bed_label` VARCHAR(120) NOT NULL,
    `capacity_label` VARCHAR(120) NOT NULL,
    `base_price_vnd` INTEGER NOT NULL,
    `check_in_time` VARCHAR(10) NOT NULL DEFAULT '14:00',
    `check_out_time` VARCHAR(10) NOT NULL DEFAULT '12:00',
    `paragraphs` JSON NULL,
    `policy_bullets` JSON NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `room_types_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- room_type_gallery
CREATE TABLE `room_type_gallery` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `room_type_id` INTEGER NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `room_type_gallery_room_type_id_idx`(`room_type_id`),
    CONSTRAINT `room_type_gallery_room_type_id_fkey` FOREIGN KEY (`room_type_id`) REFERENCES `room_types`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- amenities
CREATE TABLE `amenities` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `icon` VARCHAR(80) NOT NULL,
    `label` VARCHAR(200) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- property_amenities
CREATE TABLE `property_amenities` (
    `property_id` INTEGER NOT NULL,
    `amenity_id` INTEGER NOT NULL,
    PRIMARY KEY (`property_id`, `amenity_id`),
    CONSTRAINT `property_amenities_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `property_amenities_amenity_id_fkey` FOREIGN KEY (`amenity_id`) REFERENCES `amenities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- room_type_amenities
CREATE TABLE `room_type_amenities` (
    `room_type_id` INTEGER NOT NULL,
    `amenity_id` INTEGER NOT NULL,
    PRIMARY KEY (`room_type_id`, `amenity_id`),
    CONSTRAINT `room_type_amenities_room_type_id_fkey` FOREIGN KEY (`room_type_id`) REFERENCES `room_types`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `room_type_amenities_amenity_id_fkey` FOREIGN KEY (`amenity_id`) REFERENCES `amenities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- rooms (inventory)
CREATE TABLE `rooms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branch_id` INTEGER NOT NULL,
    `room_type_id` INTEGER NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `price_vnd` INTEGER NOT NULL,
    `description` TEXT NOT NULL,
    `image_url` VARCHAR(500) NULL,
    `alt_text` VARCHAR(255) NULL,
    `max_adults` INTEGER NOT NULL DEFAULT 2,
    `max_children` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('available', 'pending', 'booked') NOT NULL DEFAULT 'available',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `rooms_branch_id_code_key`(`branch_id`, `code`),
    PRIMARY KEY (`id`),
    CONSTRAINT `rooms_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `rooms_room_type_id_fkey` FOREIGN KEY (`room_type_id`) REFERENCES `room_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- users
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(30) NULL,
    `membership_tier` ENUM('standard', 'gold', 'diamond') NOT NULL DEFAULT 'standard',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- promo_codes
CREATE TABLE `promo_codes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(40) NOT NULL,
    `discount_percent` INTEGER NOT NULL,
    `valid_from` DATE NOT NULL,
    `valid_to` DATE NOT NULL,
    `max_uses` INTEGER NULL,
    `used_count` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `promo_codes_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- bookings
CREATE TABLE `bookings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_code` VARCHAR(40) NOT NULL,
    `user_id` INTEGER NULL,
    `room_id` INTEGER NOT NULL,
    `property_id` INTEGER NOT NULL,
    `branch_id` INTEGER NOT NULL,
    `room_type_id` INTEGER NOT NULL,
    `room_code` VARCHAR(50) NOT NULL,
    `property_name` VARCHAR(255) NOT NULL,
    `branch_name` VARCHAR(255) NOT NULL,
    `check_in` DATE NOT NULL,
    `check_out` DATE NOT NULL,
    `nights` INTEGER NOT NULL,
    `adults` INTEGER NOT NULL DEFAULT 2,
    `children` INTEGER NOT NULL DEFAULT 0,
    `guest_name` VARCHAR(255) NOT NULL,
    `guest_phone` VARCHAR(30) NOT NULL,
    `guest_email` VARCHAR(255) NOT NULL,
    `special_note` TEXT NULL,
    `price_per_night_vnd` INTEGER NOT NULL,
    `subtotal_vnd` INTEGER NOT NULL,
    `service_fee_vnd` INTEGER NOT NULL DEFAULT 0,
    `discount_vnd` INTEGER NOT NULL DEFAULT 0,
    `total_vnd` INTEGER NOT NULL,
    `promo_code` VARCHAR(40) NULL,
    `status` ENUM('draft', 'pending_payment', 'confirmed', 'cancelled', 'completed', 'no_show') NOT NULL DEFAULT 'pending_payment',
    `hold_expires_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `bookings_booking_code_key`(`booking_code`),
    INDEX `bookings_user_id_idx`(`user_id`),
    INDEX `bookings_room_id_idx`(`room_id`),
    INDEX `bookings_status_idx`(`status`),
    PRIMARY KEY (`id`),
    CONSTRAINT `bookings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `bookings_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `bookings_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `bookings_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- payments
CREATE TABLE `payments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` INTEGER NOT NULL,
    `method` ENUM('card', 'bank', 'wallet') NOT NULL,
    `amount_vnd` INTEGER NOT NULL,
    `status` ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    `provider_ref` VARCHAR(255) NULL,
    `paid_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `payments_booking_id_key`(`booking_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `payments_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
