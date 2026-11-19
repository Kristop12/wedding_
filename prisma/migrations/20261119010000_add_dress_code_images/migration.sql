-- CreateTable
CREATE TABLE `DressCodeImage` (
    `id` VARCHAR(191) NOT NULL,
    `weddingId` VARCHAR(191) NOT NULL,
    `imageKey` VARCHAR(80) NOT NULL,
    `caption` VARCHAR(160) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `DressCodeImage_weddingId_sortOrder_idx`(`weddingId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DressCodeImage` ADD CONSTRAINT `DressCodeImage_weddingId_fkey` FOREIGN KEY (`weddingId`) REFERENCES `Wedding`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
