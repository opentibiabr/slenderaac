import { error, fail, redirect } from '@sveltejs/kit';

import { scheduleInput } from '$lib/server/news/schedule';
import { prisma } from '$lib/server/prisma';

import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ params }) => {
	const event = await prisma.scheduleEvent.findUnique({
		where: { id: params.id },
	});
	if (!event) throw error(404, 'Event not found');
	return { title: 'Edit event', event };
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ request, params }) => {
		const previous = await prisma.scheduleEvent.findUnique({
			where: { id: params.id },
			select: { id: true },
		});
		if (!previous) throw error(404, 'Event not found');
		const form = await request.formData();
		if (form.get('_method') === 'DELETE') {
			await prisma.scheduleEvent.delete({ where: { id: params.id } });
		} else {
			const data = scheduleInput(form);
			if (!data)
				return fail(400, {
					errors: {
						global: [
							'Enter a title, a valid date range, color and display order.',
						],
					},
				});
			await prisma.scheduleEvent.update({ where: { id: params.id }, data });
		}
		throw redirect(303, '/admin/events');
	},
} satisfies Actions;
