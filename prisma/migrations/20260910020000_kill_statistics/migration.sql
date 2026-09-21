CREATE TABLE `slender_kill_collectors` (
  `id` VARCHAR(36) NOT NULL,
  `started_at` INT UNSIGNED NOT NULL,
  `updated_at` INT UNSIGNED NOT NULL,
  `dropped_events` INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `slender_kill_collectors_updated_idx` (`updated_at`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `slender_kill_statistics` (
  `collector_id` VARCHAR(36) NOT NULL,
  `minute` INT UNSIGNED NOT NULL,
  `race` VARCHAR(255) NOT NULL,
  `players_killed` INT UNSIGNED NOT NULL DEFAULT 0,
  `killed_by_players` INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`collector_id`, `minute`, `race`),
  INDEX `slender_kill_statistics_minute_idx` (`minute`),
  CONSTRAINT `slender_kill_statistics_collector_fk` FOREIGN KEY (`collector_id`)
    REFERENCES `slender_kill_collectors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
