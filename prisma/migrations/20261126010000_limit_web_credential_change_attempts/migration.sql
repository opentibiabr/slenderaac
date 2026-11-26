CREATE TABLE `slender_credential_change_attempts` (
    `account_id` INTEGER UNSIGNED NOT NULL,
    `failures` INTEGER UNSIGNED NOT NULL,
    `window_until` BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (`account_id`),
    CONSTRAINT `slender_credential_change_attempt_account_fk`
        FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
        ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB;
