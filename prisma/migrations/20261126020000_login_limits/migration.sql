CREATE TABLE `slender_login_limits` (
    `bucket` VARCHAR(80) NOT NULL,
    `attempts` INTEGER UNSIGNED NOT NULL,
    `expires_at` BIGINT UNSIGNED NOT NULL,

    PRIMARY KEY (`bucket`),
    INDEX `slender_login_limits_expires_at_idx`(`expires_at`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
