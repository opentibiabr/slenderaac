CREATE TABLE `slender_directory_entries` (
  `id` VARCHAR(191) NOT NULL,
  `kind` VARCHAR(16) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `url` TEXT NOT NULL,
  `description` TEXT NOT NULL,
  `details` JSON NOT NULL,
  `promoted` BOOLEAN NOT NULL DEFAULT false,
  `featured` BOOLEAN NOT NULL DEFAULT false,
  `published` BOOLEAN NOT NULL DEFAULT false,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `slender_directory_public_idx` (`kind`, `published`, `promoted`, `name`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `slender_directory_entries` (`id`, `kind`, `name`, `url`, `description`, `details`, `published`, `featured`)
VALUES ('community-projects', 'fansite', 'OpenTibiaBR', 'https://github.com/opentibiabr', 'Open-source server projects, development resources and community contributions.', '{"languages":["en","pt"],"content":["tools"],"socials":[],"countries":[]}', true, true);
