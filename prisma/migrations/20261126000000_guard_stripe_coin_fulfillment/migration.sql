ALTER TABLE `slender_coin_orders`
    ADD COLUMN `stripe_fulfillment_enabled` BOOLEAN NOT NULL DEFAULT false;
