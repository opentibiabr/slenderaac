CREATE TABLE `slender_account_2fa_setup` (
    `session_id` VARCHAR(191) NOT NULL,
    `id` VARCHAR(191) NOT NULL,
    `secret` VARCHAR(255) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `slender_account_2fa_setup_id_key`(`id`),
    PRIMARY KEY (`session_id`),
    CONSTRAINT `slender_account_2fa_setup_session_id_fkey`
        FOREIGN KEY (`session_id`) REFERENCES `slender_sessions`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
