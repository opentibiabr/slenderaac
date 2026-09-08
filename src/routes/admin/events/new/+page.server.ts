import { fail, redirect } from '@sveltejs/kit';

import { scheduleInput } from '$lib/server/news/schedule';
import { prisma } from '$lib/server/prisma';

import type { Actions } from './$types';

export const actions = {
	default: async ({ request }) => {
		const data = scheduleInput(await request.formData());
		if (!data)
			return fail(400, {
				errors: {
					global: [
						'Enter a title, a valid date range, color and display order.',
					],
				},
			});
		await prisma.scheduleEvent.create({ data });
		throw redirect(303, '/admin/events');
	},
} satisfies Actions;
