-- Mở rộng promo_codes: % hoặc giảm cố định VND
ALTER TABLE `promo_codes`
  ADD COLUMN `discount_type` ENUM('percent', 'fixed_amount') NOT NULL DEFAULT 'percent' AFTER `code`,
  ADD COLUMN `discount_amount_vnd` INTEGER NULL AFTER `discount_percent`,
  ADD COLUMN `min_subtotal_vnd` INTEGER NOT NULL DEFAULT 0 AFTER `discount_amount_vnd`,
  ADD COLUMN `description` VARCHAR(500) NULL AFTER `min_subtotal_vnd`;

ALTER TABLE `promo_codes` MODIFY `discount_percent` INTEGER NULL;

UPDATE `promo_codes`
SET `discount_type` = 'percent'
WHERE `discount_percent` IS NOT NULL;
