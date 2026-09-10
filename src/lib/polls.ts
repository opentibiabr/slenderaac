import { communityFormDateInput } from './community-forms';

export type PollOption = { id: string; label: string };

export function pollOptions(value: unknown): PollOption[] {
	if (!Array.isArray(value) || value.length < 2 || value.length > 20)
		throw new Error('A poll needs between two and twenty options');
	const ids = new Set<string>();
	const labels = new Set<string>();
	return value.map((item: unknown) => {
		if (!item || typeof item !== 'object' || Array.isArray(item))
			throw new Error('Invalid poll option');
		const option = item as Record<string, unknown>;
		if (
			typeof option.id !== 'string' ||
			!/^[a-z][a-z0-9_-]{0,31}$/.test(option.id) ||
			ids.has(option.id) ||
			typeof option.label !== 'string' ||
			!option.label.trim() ||
			option.label.length > 255 ||
			labels.has(option.label.trim().toLowerCase())
		)
			throw new Error('Invalid or duplicate poll option');
		ids.add(option.id);
		labels.add(option.label.trim().toLowerCase());
		return { id: option.id, label: option.label.trim() };
	});
}

export function pollInput(data: FormData) {
	const text = (key: string) =>
		typeof data.get(key) === 'string' ? (data.get(key) as string).trim() : '';
	const title = text('title');
	const description = text('description');
	const starts_at = communityFormDateInput(text('starts_at'));
	const end = text('ends_at');
	const ends_at = end ? communityFormDateInput(end) : null;
	if (
		!title ||
		title.length > 255 ||
		description.length > 16000 ||
		!starts_at ||
		(end && !ends_at) ||
		(ends_at && ends_at <= starts_at)
	)
		return null;
	try {
		const options = pollOptions(
			text('options')
				.split(/\r?\n/)
				.filter((line) => line.trim())
				.map((label, i) => ({ id: `o${i + 1}`, label })),
		);
		return {
			title,
			description,
			starts_at,
			ends_at,
			published: data.get('published') === 'on',
			options,
		};
	} catch {
		return null;
	}
}

export function pollChoice(data: FormData, options: PollOption[]) {
	const choices = data.getAll('option');
	return choices.length === 1 &&
		typeof choices[0] === 'string' &&
		options.some((option) => option.id === choices[0])
		? choices[0]
		: null;
}

export function pollResults(
	options: PollOption[],
	votes: { option_id: string; count: number }[],
) {
	const counts = new Map(votes.map((vote) => [vote.option_id, vote.count]));
	const total = options.reduce(
		(sum, option) => sum + (counts.get(option.id) ?? 0),
		0,
	);
	return {
		total,
		options: options.map((option) => ({
			...option,
			count: counts.get(option.id) ?? 0,
			percent: total ? ((counts.get(option.id) ?? 0) * 100) / total : 0,
		})),
	};
}
