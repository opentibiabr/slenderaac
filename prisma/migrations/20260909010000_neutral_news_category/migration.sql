-- Preserve the first category from an earlier theme preview when upgrading.
SET @previous_category = (
    SELECT SUBSTRING_INDEX(SUBSTRING_INDEX(COLUMN_TYPE, CHAR(39), 2), CHAR(39), -1)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'slender_news'
      AND COLUMN_NAME = 'category'
);

ALTER TABLE `slender_news`
    MODIFY COLUMN `category` VARCHAR(32) NOT NULL DEFAULT 'community';

UPDATE `slender_news`
SET `category` = 'server'
WHERE `category` = @previous_category;

ALTER TABLE `slender_news`
    MODIFY COLUMN `category` ENUM('server', 'community', 'development', 'support', 'technical')
    NOT NULL DEFAULT 'community';
