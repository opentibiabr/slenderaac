-- Existing server schemas can identify the player with either `player_guid` or `player_id`.
-- Create the shared index before the legacy squash so its name-based idempotency check works for both layouts.
-- Some newer schemas omit `player_misc`, which the application migration still exposes and indexes.
CREATE TABLE IF NOT EXISTS `player_misc` (
    `player_id` INTEGER NOT NULL,
    `info` BLOB NOT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

SET @player_charms_key_column = (
    SELECT CASE
        WHEN EXISTS (
            SELECT 1
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = 'player_charms'
                AND COLUMN_NAME = 'player_guid'
        ) THEN 'player_guid'
        WHEN EXISTS (
            SELECT 1
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = 'player_charms'
                AND COLUMN_NAME = 'player_id'
        ) THEN 'player_id'
        ELSE NULL
    END
);

SET @player_charms_index_exists = (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'player_charms'
        AND INDEX_NAME = 'player_charms_unique'
);

SET @player_charms_index_ddl = IF(
    @player_charms_key_column IS NOT NULL AND @player_charms_index_exists = 0,
    CONCAT(
        'ALTER TABLE `player_charms` ADD UNIQUE INDEX `player_charms_unique` (`',
        @player_charms_key_column,
        '`)'
    ),
    'SELECT 1'
);

PREPARE player_charms_index_statement FROM @player_charms_index_ddl;
EXECUTE player_charms_index_statement;
DEALLOCATE PREPARE player_charms_index_statement;
