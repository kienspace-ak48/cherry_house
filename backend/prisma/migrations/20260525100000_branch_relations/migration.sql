-- AddForeignKey
ALTER TABLE `branches` ADD CONSTRAINT `branches_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX `branches_property_id_code_key` ON `branches`(`property_id`, `code`);
