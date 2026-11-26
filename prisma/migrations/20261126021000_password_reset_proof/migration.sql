ALTER TABLE `slender_password_resets`
    ADD COLUMN `account_fingerprint` CHAR(64) NULL,
    ADD COLUMN `attempts` INTEGER NOT NULL DEFAULT 0;
