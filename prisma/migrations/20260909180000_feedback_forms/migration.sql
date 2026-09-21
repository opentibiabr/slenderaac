CREATE TABLE `slender_feedback_forms` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `questions` JSON NOT NULL,
    `starts_at` DATE NOT NULL,
    `ends_at` DATE NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `slender_feedback_forms_public_idx` (`published`, `starts_at`, `ends_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `slender_feedback_responses` (
    `id` VARCHAR(191) NOT NULL,
    `form_id` VARCHAR(191) NOT NULL,
    `account_id` INTEGER UNSIGNED NULL,
    `answers` JSON NOT NULL,
    `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `slender_feedback_response_account_unique` (`form_id`, `account_id`),
    INDEX `slender_feedback_responses_date_idx` (`submitted_at`),
    INDEX `slender_feedback_responses_account_idx` (`account_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `slender_feedback_responses_form_fk` FOREIGN KEY (`form_id`) REFERENCES `slender_feedback_forms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `slender_feedback_responses_account_fk` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `slender_feedback_forms` (`id`, `title`, `description`, `questions`, `starts_at`, `published`)
VALUES ('server-feedback', 'Server Feedback', 'Tell us about your experience playing on the server. Your answers are shared privately with the server administrators.',
    '[{"id":"q1","label":"What do you enjoy about the server?","required":true},{"id":"q2","label":"What would you like us to improve?","required":true}]', '1970-01-01', true);
