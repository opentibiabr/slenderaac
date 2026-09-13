export function communityFormOpen(
	form: { published: boolean; starts_at: Date; ends_at: Date | null },
	now = new Date(),
) {
	return (
		form.published &&
		form.starts_at <= now &&
		(!form.ends_at || form.ends_at > now)
	);
}

export function communityFormDateInput(value: string) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '1970-01-01') return null;
	const date = new Date(`${value}T00:00:00Z`);
	return Number.isFinite(date.getTime()) &&
		date.toISOString().slice(0, 10) === value
		? date
		: null;
}

export function communityFormDate(date: Date | null) {
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

export function communityEditorValues(data: FormData) {
	const limits = {
		title: 255,
		description: 16000,
		questions: 5120,
		options: 5120,
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
