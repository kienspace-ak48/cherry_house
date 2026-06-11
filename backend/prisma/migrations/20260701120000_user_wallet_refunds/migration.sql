-- AlterEnum PaymentMethod: add cherry_wallet
ALTER TABLE `payments` MODIFY `method` ENUM('card', 'bank', 'wallet', 'momo', 'cherry_wallet') NOT NULL;

-- CreateTable user_wallets
CREATE TABLE `user_wallets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `balance_vnd` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_wallets_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable wallet_transactions
CREATE TABLE `wallet_transactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `amount_vnd` INTEGER NOT NULL,
    `balance_after_vnd` INTEGER NOT NULL,
    `type` ENUM('refund', 'pay_booking', 'admin_adjust') NOT NULL,
    `booking_id` INTEGER NULL,
    `note` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `wallet_transactions_user_id_idx`(`user_id`),
    INDEX `wallet_transactions_created_at_idx`(`created_at`),
    INDEX `wallet_transactions_booking_id_idx`(`booking_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable booking_refunds
CREATE TABLE `booking_refunds` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` INTEGER NOT NULL,
    `user_id` INTEGER NULL,
    `refund_percent` INTEGER NOT NULL,
    `refund_amount_vnd` INTEGER NOT NULL DEFAULT 0,
    `policy_code` ENUM('before_24h_full', 'within_24h_none', 'not_paid', 'admin_override') NOT NULL,
    `destination` ENUM('wallet') NOT NULL DEFAULT 'wallet',
    `status` ENUM('completed', 'skipped') NOT NULL DEFAULT 'skipped',
    `cancelled_by` ENUM('user', 'admin') NOT NULL,
    `hours_before_check_in` DECIMAL(8, 2) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `booking_refunds_booking_id_key`(`booking_id`),
    INDEX `booking_refunds_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_wallets` ADD CONSTRAINT `user_wallets_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `wallet_transactions` ADD CONSTRAINT `wallet_transactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `wallet_transactions` ADD CONSTRAINT `wallet_transactions_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `booking_refunds` ADD CONSTRAINT `booking_refunds_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
