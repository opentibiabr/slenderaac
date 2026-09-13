CREATE TABLE `slender_achievement_showcase` (
    `player_id` INTEGER NOT NULL,
    `achievement_id` INTEGER NOT NULL,
    `position` INTEGER NOT NULL,

    PRIMARY KEY (`player_id`, `achievement_id`),
    UNIQUE INDEX `slender_achievement_showcase_player_id_position_key` (`player_id`, `position`),
    CONSTRAINT `slender_achievement_showcase_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
