-- AlterEnum: thêm momo vào payment method
ALTER TABLE `payments` MODIFY `method` ENUM('card', 'bank', 'wallet', 'momo') NOT NULL;
