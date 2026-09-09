import { isThemeSwitchingEnabled } from '$lib/server/theme-assets/selection';

import { env } from '$env/dynamic/private';
import {
	ENABLE_STRIPE_CHECKOUT,
	ENABLE_STRIPE_CUSTOM,
	REQUIRE_EMAIL_CONFIRMATION_TO_LOGIN,
} from '$env/static/private';

export const themeSwitcherEnabled = isThemeSwitchingEnabled(
	env.SLENDER_THEME_SWITCHER_ENABLED,
);

export const enableStripeCustom = ENABLE_STRIPE_CUSTOM === 'true';
export const enableStripeCheckout = ENABLE_STRIPE_CHECKOUT === 'true';

export const requireEmailVerification =
	REQUIRE_EMAIL_CONFIRMATION_TO_LOGIN === 'true';
