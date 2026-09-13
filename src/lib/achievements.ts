export type AchievementRecord = {
	id: number;
	name: string;
	description: string;
	grade: number;
	points: number;
	secret: boolean;
};

export function parseAchievementRecords(value: unknown): AchievementRecord[] {
	if (!Array.isArray(value) || value.length > 10000)
		throw new Error('Invalid achievement catalog');
	const ids = new Set<number>();
	const names = new Set<string>();
	return value.map((entry: unknown) => {
		if (!entry || typeof entry !== 'object')
			throw new Error('Invalid achievement definition');
		const row = entry as Record<string, unknown>;
		if (
			typeof row.id !== 'number' ||
			!Number.isSafeInteger(row.id) ||
			row.id < 1 ||
			row.id > 65535 ||
			typeof row.name !== 'string' ||
			!row.name.trim() ||
			row.name.length > 200 ||
			typeof row.description !== 'string' ||
			!row.description.trim() ||
			row.description.length > 5000 ||
			typeof row.grade !== 'number' ||
			!Number.isSafeInteger(row.grade) ||
			row.grade < 1 ||
			row.grade > 4 ||
			typeof row.points !== 'number' ||
			!Number.isSafeInteger(row.points) ||
			row.points < 0 ||
			row.points > 255 ||
			typeof row.secret !== 'boolean' ||
			ids.has(row.id) ||
			names.has(row.name.toLowerCase())
		)
			throw new Error('Invalid or duplicate achievement definition');
		ids.add(row.id);
		names.add(row.name.toLowerCase());
		return {
			id: row.id,
			name: row.name,
			description: row.description,
			grade: row.grade,
			points: row.points,
			secret: row.secret,
		};
	});
}

/** Public catalog responses contain no secret identities or descriptions. */
export function publicAchievements(records: AchievementRecord[]) {
	return {
		groups: [1, 2, 3, 4].map((grade) => {
			const entries = records
				.filter((entry) => entry.grade === grade && !entry.secret)
				.sort((a, b) => a.name.localeCompare(b.name, 'en'))
				.map(({ id, name, description, points }) => ({
					id,
					name,
					description,
					points,
				}));
			const points = records
				.filter((entry) => entry.grade === grade)
				.map((entry) => entry.points);
			return {
				grade,
				entries,
				minimumPoints: points.length ? Math.min(...points) : null,
				maximumPoints: points.length ? Math.max(...points) : null,
			};
		}),
		secretCount: records.filter((entry) => entry.secret).length,
	};
}
