-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_primaryGuardianId_fkey`;

-- AlterTable
ALTER TABLE `users` MODIFY `primaryGuardianId` BIGINT NULL;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_primaryGuardianId_fkey` FOREIGN KEY (`primaryGuardianId`) REFERENCES `guardians`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
