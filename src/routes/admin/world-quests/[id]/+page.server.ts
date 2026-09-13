import { error, redirect } from '@sveltejs/kit';

import { prisma } from '$lib/server/prisma';
import {
	questAdminWrite,
	questFormError,
	requireQuest,
} from '$lib/server/world-quests-admin';
import {
	questInput,
	questResultInput,
	withinQuestDates,
} from '$lib/world-quests';

import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ params, url }) => {
	const quest = await prisma.worldQuest.findUnique({
		where: { id: params.id },
		include: {
			events: { orderBy: { starts_at: 'desc' } },
			results: { orderBy: [{ occurred_at: 'desc' }, { id: 'asc' }] },
		},
	});
	if (!quest) throw error(404, 'World quest not found');
	const selected = url.searchParams.get('result');
	const result = selected
		? quest.results.find((entry) => entry.id === selected)
		: null;
	if (selected && !result) throw error(404, 'Quest result not found');
	return { title: 'Edit world quest', quest, result };
}) satisfies PageServerLoad;

export const actions = {
	save: async ({ request, params }) => {
		const data = questInput(await request.formData());
		if (!data)
			return questFormError(
				'Enter a valid name, description, kind and display order.',
			);
		return questAdminWrite(async (tx) => {
			const previous = await requireQuest(tx, params.id);
			if (data.slug !== previous.slug)
				return questFormError(
					'The published URL identifier cannot be changed.',
				);
			if (data.kind !== previous.kind) {
				const [events, results] = await Promise.all([
					tx.scheduleEvent.count({ where: { world_quest_id: params.id } }),
					tx.worldQuestResult.count({ where: { world_quest_id: params.id } }),
				]);
				if (events || results)
					return questFormError(
						'Remove linked calendar events and results before changing the quest kind.',
					);
			}
			await tx.worldQuest.update({ where: { id: params.id }, data });
			return { saved: true };
		});
	},
	remove: async ({ params }) => {
		const result = await questAdminWrite(async (tx) => {
			await requireQuest(tx, params.id);
			await tx.worldQuestResult.deleteMany({
				where: { world_quest_id: params.id },
			});
			await tx.worldQuest.delete({ where: { id: params.id } });
			return { removed: true };
		});
		if (!('removed' in result)) return result;
		throw redirect(303, '/admin/world-quests');
	},
	saveResult: async ({ request, params }) => {
		const form = await request.formData();
		const input = questResultInput(form);
		const id = String(form.get('id') ?? '') || null;
		if (!input)
			return questFormError(
				'Enter a valid outcome and a past or present UTC timestamp.',
			);
		const result = await questAdminWrite(async (tx) => {
			const quest = await requireQuest(tx, params.id);
			if (
				id &&
				!(await tx.worldQuestResult.findFirst({
					where: { id, world_quest_id: quest.id },
				}))
			)
				throw error(404, 'Quest result not found');
			const event = input.schedule_event_id
				? await tx.scheduleEvent.findFirst({
						where: { id: input.schedule_event_id, world_quest_id: quest.id },
					})
				: null;
			if (
				(input.schedule_event_id && !event) ||
				(quest.kind === 'event' && !event) ||
				(quest.kind === 'task' && input.schedule_event_id)
			)
				return questFormError(
					'Choose a calendar occurrence belonging to this event quest. Tasks do not use a calendar occurrence.',
				);
			if (event && !withinQuestDates(input.occurred_at, event))
				return questFormError(
					'The result timestamp must fall within the selected calendar occurrence.',
				);
			const data = { ...input, world_quest_id: quest.id };
			if (id) await tx.worldQuestResult.update({ where: { id }, data });
			else await tx.worldQuestResult.create({ data });
			return { saved: true };
		});
		if (!('saved' in result)) return result;
		throw redirect(303, `/admin/world-quests/${params.id}`);
	},
	removeResult: async ({ request, params }) => {
		const id = String((await request.formData()).get('id') ?? '');
		const removed = await questAdminWrite(async (tx) => {
			await requireQuest(tx, params.id);
			const result = await tx.worldQuestResult.deleteMany({
				where: { id, world_quest_id: params.id },
			});
			if (!result.count) throw error(404, 'Quest result not found');
			return { removed: true };
		});
		if (!('removed' in removed)) return removed;
		throw redirect(303, `/admin/world-quests/${params.id}`);
	},
} satisfies Actions;
