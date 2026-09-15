CREATE TABLE `slender_world_quests` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `kind` ENUM('event', 'task') NOT NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `slender_world_quests_slug_key` (`slug`),
    INDEX `slender_world_quests_public_idx` (`published`, `kind`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `slender_schedule_events` ADD COLUMN `world_quest_id` VARCHAR(191) NULL;
CREATE INDEX `slender_schedule_events_world_quest_idx` ON `slender_schedule_events` (`world_quest_id`);
ALTER TABLE `slender_schedule_events` ADD CONSTRAINT `slender_schedule_events_world_quest_id_fkey`
    FOREIGN KEY (`world_quest_id`) REFERENCES `slender_world_quests` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `slender_world_quest_results` (
    `id` VARCHAR(191) NOT NULL,
    `world_quest_id` VARCHAR(191) NOT NULL,
    `schedule_event_id` VARCHAR(191) NULL,
    `outcome` ENUM('success', 'failure') NOT NULL,
    `occurred_at` DATETIME(3) NOT NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `slender_world_quest_results_schedule_event_id_key` (`schedule_event_id`),
    INDEX `slender_world_quest_results_public_idx` (`world_quest_id`, `published`, `occurred_at`),
    PRIMARY KEY (`id`),
    CONSTRAINT `slender_world_quest_results_world_quest_id_fkey` FOREIGN KEY (`world_quest_id`) REFERENCES `slender_world_quests` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `slender_world_quest_results_schedule_event_id_fkey` FOREIGN KEY (`schedule_event_id`) REFERENCES `slender_schedule_events` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
