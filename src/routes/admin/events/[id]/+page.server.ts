import { error, redirect } from '@sveltejs/kit';

import { linkedScheduleInput } from '$lib/server/news/schedule';
import { prisma } from '$lib/server/prisma';
import {
	questAdminWrite,
	questFormError,
} from '$lib/server/world-quests-admin';
import { withinQuestDates } from '$lib/world-quests';

import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ params }) => {
	const event = await prisma.scheduleEvent.findUnique({
		where: { id: params.id },
	});
	if (!event) throw error(404, 'Event not found');
	return {
		title: 'Edit event',
		event,
		quests: await prisma.worldQuest.findMany({
			where: { kind: 'event' },
			select: { id: true, name: true },
			orderBy: { name: 'asc' },
		}),
	};
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ request, params }) => {
		const form = await request.formData();
		const result = await questAdminWrite(async (tx) => {
			const previous = await tx.scheduleEvent.findUnique({
				where: { id: params.id },
				include: { quest_result: true },
			});
			if (!previous) throw error(404, 'Event not found');
			if (form.get('_method') === 'DELETE') {
				if (previous.quest_result)
					return questFormError(
						'Remove the linked result before deleting this calendar occurrence.',
						409,
					);
				await tx.scheduleEvent.delete({ where: { id: params.id } });
			} else {
				const data = await linkedScheduleInput(form, tx);
				if (!data)
					return questFormError(
						'Enter a title or linked event quest, a valid date range, color and display order.',
					);
				if (
					previous.quest_result &&
					(previous.world_quest_id !== data.world_quest_id ||
						!withinQuestDates(previous.quest_result.occurred_at, data))
				)
					return questFormError(
						'The linked result must remain in this quest and within its calendar dates.',
					);
				await tx.scheduleEvent.update({ where: { id: params.id }, data });
			}
			return { saved: true };
		});
		if (!('saved' in result)) return result;
		throw redirect(303, '/admin/events');
	},
} satisfies Actions;
