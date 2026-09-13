export function numberParam(
	params: URLSearchParams,
	name: string,
	fallback: number,
	min: number,
	max: number,
) {
	const raw = params.get(name);
	if (raw === null || raw.trim() === '') return fallback;
	const value = Number(raw);
	return Number.isFinite(value)
		? Math.min(max, Math.max(min, Math.trunc(value)))
		: fallback;
}

export function monthDate(year: number, month: number, day = 1) {
	return new Date(
		Date.UTC(
			year,
			month - 1,
			Math.min(day, new Date(Date.UTC(year, month, 0)).getUTCDate()),
		),
	);
}

export function referenceDate(value: string) {
	return new Date(`${value.replace(/\s*-\s*$/, '')} 12:00:00 GMT`);
}
