import type { Prisma } from '@prisma/client';

import { newsDate } from '$lib/news';

export function scheduleInput(form: FormData, linkedQuest = false) {
	const title = String(form.get('title') ?? '').trim();
	const description = String(form.get('description') ?? '').trim();
	const starts_at = newsDate(form.get('starts_at'));
	const ends_at = newsDate(form.get('ends_at'));
	const color = String(form.get('color') ?? '');
	const sort_order = Number(form.get('sort_order'));
	if (
		(!title && !linkedQuest) ||
		title.length > 255 ||
		description.length > 16000 ||
		!starts_at ||
		!ends_at ||
		starts_at > ends_at ||
		!/^#[0-9a-f]{6}$/i.test(color) ||
		!Number.isInteger(sort_order) ||
		Math.abs(sort_order) > 10000
	)
		return null;
	// MySQL DATE columns and the public calendar use midnight UTC.
	starts_at.setUTCHours(0, 0, 0, 0);
	ends_at.setUTCHours(0, 0, 0, 0);
	return {
		title,
		description,
		starts_at,
		ends_at,
		color,
		sort_order,
		seasonal: form.get('seasonal') === 'on',
		published: form.get('published') === 'on',
	};
}

export async function linkedScheduleInput(
	form: FormData,
	tx: Prisma.TransactionClient,
) {
	const id = String(form.get('world_quest_id') ?? '').trim() || null;
	if (
		id &&
		!(await tx.worldQuest.findFirst({
			where: { id, kind: 'event' },
			select: { id: true },
		}))
	)
		return null;
	const data = scheduleInput(form, Boolean(id));
	return data ? { ...data, world_quest_id: id } : null;
}

export function schedulePresentation<
	T extends {
		title: string;
		description: string;
		world_quest?: { name: string; description: string } | null;
	},
>(event: T) {
	return {
		...event,
		title: event.title || event.world_quest?.name || '',
		description: event.description || event.world_quest?.description || '',
	};
}
