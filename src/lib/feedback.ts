export type FeedbackQuestion = { id: string; label: string; required: boolean };

export function feedbackQuestions(value: unknown): FeedbackQuestion[] {
	if (!Array.isArray(value) || !value.length || value.length > 20)
		throw new Error('A feedback form needs between one and twenty questions');
	const ids = new Set<string>();
	return value.map((item: unknown) => {
		if (!item || typeof item !== 'object' || Array.isArray(item))
			throw new Error('Invalid question');
		const q = item as Record<string, unknown>;
		if (
			typeof q.id !== 'string' ||
			!/^[a-z][a-z0-9_-]{0,31}$/.test(q.id) ||
			ids.has(q.id) ||
			typeof q.label !== 'string' ||
			!q.label.trim() ||
			q.label.length > 255 ||
			typeof q.required !== 'boolean'
		)
			throw new Error('Invalid or duplicate question');
		ids.add(q.id);
		return { id: q.id, label: q.label.trim(), required: q.required };
	});
}

export function feedbackOpen(
	form: { published: boolean; starts_at: Date; ends_at: Date | null },
	now = new Date(),
) {
	return (
		form.published &&
		form.starts_at <= now &&
		(!form.ends_at || form.ends_at > now)
	);
}

export function feedbackAnswers(data: FormData, questions: FeedbackQuestion[]) {
	const values: Record<string, string> = {};
	const errors: Record<string, string[]> = {};
	let length = 0;
	for (const question of questions) {
		const entries = data.getAll(`answer-${question.id}`);
		const value =
			entries.length <= 1 &&
			(entries[0] === undefined || typeof entries[0] === 'string')
				? ((entries[0] as string | undefined)?.trim() ?? '')
				: null;
		if (
			value === null ||
			value.length > 2000 ||
			(question.required && !value)
		) {
			errors[question.id] = ['Enter an answer of up to 2,000 characters.'];
		}
		values[question.id] = (value ?? '').slice(0, 2000);
		length += value?.length ?? 0;
	}
	if (length > 10000)
		errors.global = ['Keep the combined answers within 10,000 characters.'];
	return { values, errors, valid: Object.keys(errors).length === 0 };
}

export function feedbackInput(data: FormData) {
	const text = (name: string) => {
		const value = data.get(name);
		return typeof value === 'string' ? value.trim() : '';
	};
	const title = text('title');
	const description = text('description');
	const date = (value: string) => {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '1970-01-01') return null;
		const result = new Date(`${value}T00:00:00Z`);
		return Number.isFinite(result.getTime()) &&
			result.toISOString().slice(0, 10) === value
			? result
			: null;
	};
	const starts_at = date(text('starts_at'));
	const endText = text('ends_at');
	const ends_at = endText ? date(endText) : null;
	if (
		!title ||
		title.length > 255 ||
		description.length > 16000 ||
		!starts_at ||
		(endText && !ends_at) ||
		(ends_at && ends_at <= starts_at)
	)
		return null;
	try {
		const questions = feedbackQuestions(
			text('questions')
				.split(/\r?\n/)
				.filter((line) => line.trim())
				.map((label, index) => ({
					id: `q${index + 1}`,
					label,
					required: true,
				})),
		);
		return {
			title,
			description,
			starts_at,
			ends_at,
			published: data.get('published') === 'on',
			questions,
		};
	} catch {
		return null;
	}
}

export function feedbackEditorValues(data: FormData) {
	const limits = {
		title: 255,
		description: 16000,
		questions: 5120,
		starts_at: 10,
		ends_at: 10,
		published: 2,
	};
	return Object.fromEntries(
		Object.entries(limits).map(([key, limit]) => {
			const value = data.get(key);
			return [key, typeof value === 'string' ? value.slice(0, limit) : ''];
		}),
	);
}

export function feedbackDate(date: Date | null) {
	return date
		? date
				.toLocaleDateString('en-US', {
					timeZone: 'UTC',
					year: 'numeric',
					month: 'short',
					day: '2-digit',
				})
				.replace(',', '')
		: 'Ongoing';
}
