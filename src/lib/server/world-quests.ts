import { Prisma } from '@prisma/client';

import { numberParam } from '$lib/server/news/dates';
import { prisma } from '$lib/server/prisma';
import { questTiming } from '$lib/world-quests';

const questSelect = {
	id: true,
	slug: true,
	name: true,
	description: true,
	kind: true,
	events: {
		where: { published: true },
		select: { id: true, starts_at: true, ends_at: true },
		orderBy: [{ starts_at: 'asc' }, { id: 'asc' }],
	},
} satisfies Prisma.WorldQuestSelect;

export async function publicQuests() {
	const quests = await prisma.worldQuest.findMany({
		where: { published: true },
		select: questSelect,
		orderBy: [{ sort_order: 'asc' }, { name: 'asc' }, { id: 'asc' }],
	});
	return quests.map((quest) => ({ ...quest, ...questTiming(quest.events) }));
}

export async function publicQuest(identifier: string, query: URLSearchParams) {
	if (!identifier || identifier.length > 255) return null;
	let quest = await prisma.worldQuest.findFirst({
		where: { published: true, slug: identifier },
		select: questSelect,
	});
	if (!quest) {
		const matches = await prisma.worldQuest.findMany({
			where: { published: true, name: identifier },
			select: questSelect,
			take: 2,
		});
		if (matches.length !== 1) return null;
		quest = matches[0];
	}
	const visibleResults = {
		world_quest_id: quest.id,
		published: true,
		OR: [
			{ schedule_event_id: null },
			{ schedule_event: { is: { published: true } } },
		],
	} satisfies Prisma.WorldQuestResultWhereInput;
	const [successCount, failureCount] = await Promise.all([
		prisma.worldQuestResult.count({
			where: { ...visibleResults, outcome: 'success' },
		}),
		prisma.worldQuestResult.count({
			where: { ...visibleResults, outcome: 'failure' },
		}),
	]);
	const pageCount = Math.max(1, Math.ceil((successCount + failureCount) / 50));
	const resultPage = numberParam(query, 'resultpage', 1, 1, pageCount);
	const results = await prisma.worldQuestResult.findMany({
		where: visibleResults,
		select: { id: true, outcome: true, occurred_at: true },
		orderBy: [{ occurred_at: 'desc' }, { id: 'asc' }],
		skip: (resultPage - 1) * 50,
		take: 50,
	});
	return {
		...quest,
		...questTiming(quest.events),
		results,
		successCount,
		failureCount,
		resultPage,
		pageCount,
	};
}
