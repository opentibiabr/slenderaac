import { redirect } from '@sveltejs/kit';

import { linkedScheduleInput } from '$lib/server/news/schedule';
import { prisma } from '$lib/server/prisma';
import {
	questAdminWrite,
	questFormError,
} from '$lib/server/world-quests-admin';

import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ url }) => ({
	quests: await prisma.worldQuest.findMany({
		where: { kind: 'event' },
		select: { id: true, name: true },
		orderBy: { name: 'asc' },
	}),
	selectedQuest: url.searchParams.get('worldquest') ?? '',
})) satisfies PageServerLoad;

export const actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const result = await questAdminWrite(async (tx) => {
			const data = await linkedScheduleInput(form, tx);
			if (!data)
				return questFormError(
					'Enter a title or linked event quest, a valid date range, color and display order.',
				);
			return tx.scheduleEvent.create({ data });
		});
		if (!('id' in result)) return result;
		throw redirect(303, '/admin/events');
	},
} satisfies Actions;
