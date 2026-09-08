ALTER TABLE `slender_news`
    ADD COLUMN `type` ENUM('news', 'ticker', 'article') NOT NULL DEFAULT 'news',
    ADD COLUMN `category` ENUM('cipsoft', 'community', 'development', 'support', 'technical') NOT NULL DEFAULT 'community',
    ADD COLUMN `presentation` JSON NULL;

CREATE INDEX `slender_news_archive_idx` ON `slender_news`(`published`, `type`, `category`, `created_at`);

CREATE TABLE `slender_schedule_events` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `starts_at` DATE NOT NULL,
    `ends_at` DATE NOT NULL,
    `color` VARCHAR(7) NOT NULL DEFAULT '#24657b',
    `seasonal` BOOLEAN NOT NULL DEFAULT false,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `slender_schedule_events_range_idx` (`published`, `starts_at`, `ends_at`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
