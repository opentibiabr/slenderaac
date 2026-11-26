-- Older email change tokens confirm the wrong mailbox. Require a new confirmation.
DELETE FROM `slender_email_verifications`;

ALTER TABLE `slender_email_verifications`
    ADD COLUMN `current_email` VARCHAR(255) NOT NULL,
    ADD COLUMN `authorization_fingerprint` CHAR(64) NULL,
    ADD COLUMN `current_digest` CHAR(64) NULL,
    ADD COLUMN `target_digest` CHAR(64) NULL,
    ADD COLUMN `current_approved` BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN `target_approved` BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN `last_sent` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD UNIQUE INDEX `slender_email_verifications_account_id_key`(`account_id`),
    ADD UNIQUE INDEX `slender_email_verifications_current_digest_key`(`current_digest`),
    ADD UNIQUE INDEX `slender_email_verifications_target_digest_key`(`target_digest`);
