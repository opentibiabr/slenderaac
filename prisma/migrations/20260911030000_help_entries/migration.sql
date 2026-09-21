CREATE TABLE `slender_help_entries` (
  `id` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(80) NOT NULL,
  `topic` VARCHAR(16) NOT NULL,
  `title` VARCHAR(160) NOT NULL,
  `content` TEXT NOT NULL,
  `published` BOOLEAN NOT NULL DEFAULT false,
  `featured` BOOLEAN NOT NULL DEFAULT false,
  `views` INTEGER NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `slender_help_entries_slug_key` (`slug`),
  INDEX `slender_help_public_idx` (`published`, `topic`, `title`),
  INDEX `slender_help_views_idx` (`published`, `views`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `slender_help_entries` (`id`, `slug`, `topic`, `title`, `content`, `published`, `featured`) VALUES
('help-create-account', 'create-account', 'account', 'Creating an Account', 'Open [Create Account](/account/signup), choose your account details and follow the verification instructions. After signing in, use [Account Management](/account) to create a character. Keep your account credentials private.', true, true),
('help-recover-account', 'recover-account', 'account', 'Recovering an Account', 'Use [Lost Account](/account/lost) to request recovery instructions for your registered email address. If you still have access to your account, you can update its email or password in [Account Management](/account). Never send your password or authenticator codes in a public message.', true, false),
('help-enable-authenticator', 'enable-authenticator', 'account', 'Protecting an Account with an Authenticator', 'Sign in to [Account Management](/account), open the two-factor authentication option and follow the setup instructions. Save the backup codes in a safe place. A backup code is private and should not be shared.', true, false),
('help-account-security', 'account-security', 'account', 'Keeping an Account Safe', 'Use a unique password and enable two-factor authentication in [Account Management](/account). Download the game client through the local [Download](/download) page. Read the [Security Hints](/guides/security-hints) before opening links or accepting files from other players.', true, false),
('help-payment-methods', 'payment-methods', 'payments', 'Which Payment Methods Can I Use?', 'The [Webshop](/shop) lists the products, currencies and payment methods currently configured for this server. Select an available offer to see its price and payment options before confirming a purchase.', true, true),
('help-pending-payment', 'pending-payment', 'payments', 'My Payment Is Still Pending', 'Check the order confirmation page from your purchase. It shows the latest status received by the website. A payment may remain pending while the provider processes it. Do not repeat a purchase just to refresh its status; retain the order reference if you need assistance.', true, false),
('help-buy-coins', 'buy-coins', 'coins', 'How Can I Buy {{serverName}} Coins?', 'Open the [coin shop](/shop/coins), choose an available offer and currency, then follow the payment instructions. The listed offers and payment methods are configured by this server. Your [account](/account) shows the balance after a completed purchase.', true, true),
('help-coin-balance', 'coin-balance', 'coins', 'Where Can I See My Coin Balance?', 'Your [Account Management](/account) page shows the current coin balance and transferable balance recorded by the server. These values can differ. The [Webshop](/shop) describes the products currently available.', true, false),
('help-getting-started', 'getting-started', 'gameplay', 'How Do I Start Playing?', 'Create an [account](/account/signup), create a character in [Account Management](/account) and download the configured [game client](/download). The [Quickstart](/guides/quickstart) and [Manual](/guides/manual) explain the basic controls. Available features and game rules depend on this server.', true, true),
('help-find-character', 'find-character', 'gameplay', 'Finding Characters and Guilds', 'Use [Characters](/characters) to search for a public character profile, [Online Players](/online) to see who is connected, or [Guilds](/guilds) to browse local guilds. These pages show this server''s records.', true, false),
('help-install-client', 'install-client', 'technical', 'Installing the Game Client', 'Use the local [Download](/download) page to obtain the client configured by this server. Follow its installation instructions and check the [Quickstart](/guides/quickstart). Client availability and supported operating systems depend on the download supplied by the server operator.', true, true),
('help-server-unavailable', 'server-unavailable', 'technical', 'The Server Is Unavailable', 'Check [Worlds](/worlds) and [Latest News](/) for the current server status and announcements. If your connection fails, verify that you are using the client from the local [Download](/download) page. An unavailable status means the website could not confirm availability; it does not establish the cause of a connection failure.', true, false),
('help-server-rules', 'server-rules', 'rules', 'Where Can I Read the Server Rules?', 'Read the published [server rules](/pages/rules) before playing. The [Legal Documents](/support/legal-documents) page links the documents supplied by the server operator. Rules and available services are specific to this server.', true, true),
('help-report-problem', 'report-problem', 'rules', 'Reporting a Problem', 'Check [Latest News](/) and the relevant help topic first. If a [Feedback Form](/community/feedback) is open for the issue, sign in and use that form. Describe the steps, time and affected feature without sharing passwords, backup codes or payment credentials.', true, false);
