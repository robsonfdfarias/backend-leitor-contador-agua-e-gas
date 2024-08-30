-- CreateTable
CREATE TABLE `Register` (
    `id` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `customerCode` VARCHAR(191) NOT NULL,
    `measureDatetime` VARCHAR(191) NOT NULL,
    `measureType` VARCHAR(191) NOT NULL,
    `MeterValue` INTEGER NOT NULL,

    UNIQUE INDEX `Register_image_key`(`image`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
