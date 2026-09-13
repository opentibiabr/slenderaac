export type QuestKind = 'event' | 'task';
export type QuestOutcome = 'success' | 'failure';

export function questHref(slug?: string): string {
	return slug
		? `/library/world-quests?${new URLSearchParams({ worldquest: slug }).toString()}`
		: '/library/world-quests';
}

export function questInput(form: FormData) {
	const slug = String(form.get('slug') ?? '')
		.trim()
		.toLowerCase();
	const name = String(form.get('name') ?? '').trim();
	const description = String(form.get('description') ?? '').trim();
	const kind = form.get('kind');
	const sort_order = Number(form.get('sort_order'));
	if (
		!slug ||
		slug.length > 100 ||
		!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
		!name ||
		name.length > 255 ||
		!description ||
		description.length > 16000 ||
		(kind !== 'event' && kind !== 'task') ||
		!Number.isInteger(sort_order) ||
		Math.abs(sort_order) > 10000
	)
		return null;
	return {
		slug,
		name,
		description,
		kind,
		sort_order,
		published: form.get('published') === 'on',
	};
}

export function questResultInput(form: FormData, now = new Date()) {
	const outcome = form.get('outcome');
	const stamp = String(form.get('occurred_at') ?? '');
	if (
		(outcome !== 'success' && outcome !== 'failure') ||
		!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(stamp)
	)
		return null;
	const occurred_at = new Date(`${stamp}:00.000Z`);
	if (
		!Number.isFinite(occurred_at.getTime()) ||
		occurred_at.toISOString().slice(0, 16) !== stamp ||
		occurred_at > now ||
		occurred_at.getUTCFullYear() < 2000
	)
		return null;
	const schedule_event_id =
		String(form.get('schedule_event_id') ?? '').trim() || null;
	return {
		outcome,
		occurred_at,
		schedule_event_id,
		published: form.get('published') === 'on',
	};
}

export function withinQuestDates(
	date: Date,
	event: { starts_at: Date; ends_at: Date },
): boolean {
	return (
		date >= event.starts_at &&
		date.getTime() < event.ends_at.getTime() + 86_400_000
	);
}

export function questTiming<T extends { starts_at: Date; ends_at: Date }>(
	events: readonly T[],
	now = new Date(),
) {
	const today = new Date(now);
	today.setUTCHours(0, 0, 0, 0);
	const ordered = [...events].sort(
		(a, b) => a.starts_at.getTime() - b.starts_at.getTime(),
	);
	return {
		running:
			ordered.find(
				(event) => event.starts_at <= today && event.ends_at >= today,
			) ?? null,
		next: ordered.find((event) => event.starts_at > today) ?? null,
	};
}

export function questDate(date: Date, time = false): string {
	if (!time) {
		return new Intl.DateTimeFormat('en-US', {
			timeZone: 'UTC',
			year: 'numeric',
			month: 'short',
			day: '2-digit',
		})
			.formatToParts(date)
			.filter((part) => part.type !== 'literal')
			.map((part) => part.value)
			.join('\u00a0');
	}
	return (
		new Intl.DateTimeFormat('en-US', {
			timeZone: 'UTC',
			year: 'numeric',
			month: 'short',
			day: '2-digit',
			...(time ? { hour: '2-digit', minute: '2-digit', hour12: false } : {}),
		}).format(date) + (time ? ' UTC' : '')
	);
}
