INSERT INTO `slender_static_pages` (`id`, `slug`, `title`, `content`, `hide`)
SELECT 'support-parents-guide', 'parents-guide', 'Parents'' Guide', '### Contents

[Introduction](#introduction)  
[What is {{serverName}}?](#game)  
[Playing together](#playing)  
[Privacy and communication](#privacy)  
[Account security](#security)  
[Purchases](#purchases)  
[Getting help](#help)

### Introduction {% #introduction %}

This guide introduces parents and guardians to {{serverName}} and the website features available to its players. Review the server rules together before creating an account, and agree on suitable play times and spending limits.

### What is {{serverName}}? {% #game %}

{{serverName}} is an online role-playing game. Players explore a shared world, develop characters and may join other players in groups or guilds. The [Quickstart](/guides/quickstart) and [Manual](/guides/manual) explain the game and its controls.

### Playing together {% #playing %}

Talk with your child about the people they meet and the activities they enjoy. Agree on breaks and a schedule that fits other responsibilities. Online messages and player-created names are written by other people; they are not editorial content from the server operator.

### Privacy and communication {% #privacy %}

Discuss which details should stay private, including real names, addresses, phone numbers and photographs. Read the operator''s [Privacy Policy](/support/privacy-policy) for the practices that apply to this server. Avoid opening unfamiliar links or downloading files shared by other players.

### Account security {% #security %}

Use a unique password, protect the registered email address and enable the authenticator through [Account Management](/account). Keep recovery information private. The [Security Hints](/guides/security-hints) and [account help](/support/get-help?topic=account) explain the website''s account protection and recovery features.

### Purchases {% #purchases %}

Review the [Webshop](/shop) together before purchasing anything. Prices, products and payment methods depend on the server''s configuration. Check the final offer and the operator''s [Service Agreement](/support/service-agreement) before confirming a payment.

### Getting help {% #help %}

Consult the [FAQ](/support/get-help) and [Rules](/pages/rules). When an operator has opened a [Feedback Form](/community/feedback), use it for its stated purpose. Do not include passwords, authenticator codes or payment-card details in feedback.
', true
WHERE NOT EXISTS (SELECT 1 FROM `slender_static_pages` WHERE `slug` = 'parents-guide');
