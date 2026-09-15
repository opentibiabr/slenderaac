CREATE TABLE `slender_polls` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `options` JSON NOT NULL,
  `published` BOOLEAN NOT NULL DEFAULT false,
  `starts_at` DATE NOT NULL,
  `ends_at` DATE NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `slender_polls_public_idx` (`published`, `starts_at`, `ends_at`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `slender_poll_votes` (
  `id` VARCHAR(191) NOT NULL,
  `poll_id` VARCHAR(191) NOT NULL,
  `account_id` INTEGER UNSIGNED NULL,
  `option_id` VARCHAR(32) NOT NULL,
  `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `slender_poll_votes_account_unique` (`poll_id`, `account_id`),
  INDEX `slender_poll_votes_result_idx` (`poll_id`, `option_id`),
  INDEX `slender_poll_votes_account_idx` (`account_id`),
  PRIMARY KEY (`id`),
  CONSTRAINT `slender_poll_votes_poll_fk` FOREIGN KEY (`poll_id`) REFERENCES `slender_polls` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `slender_poll_votes_account_fk` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `slender_polls` (`id`, `title`, `description`, `options`, `published`, `starts_at`)
VALUES ('server-activities', 'Which activity do you enjoy most?', 'Tell the server community which activity you enjoy most. Choose one option.',
  '[{"id":"o1","label":"Exploring"},{"id":"o2","label":"Hunting"},{"id":"o3","label":"Questing"},{"id":"o4","label":"Socialising"}]', true, '1970-01-01');
