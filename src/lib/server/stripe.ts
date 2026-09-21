import Stripe from 'stripe';

import { SECRET_STRIPE_KEY } from '$env/static/private';

export const stripe = SECRET_STRIPE_KEY
	? new Stripe(SECRET_STRIPE_KEY, {
			apiVersion: '2023-10-16',
	  })
	: null;
