import fs from 'node:fs/promises';
import path from 'node:path';

import { dev } from '$app/environment';

import { env } from '$env/dynamic/private';

type CalendarReference = {
	sourceUrl: string;
	capturedAt: string;
	months: string[];
	grids?: Record<string, CalendarReference['days']>;
	days: Record<
		string,
		{
			hasSeasonalIcon: boolean;
			seasonalDescription?: string;
			events: { label: string; color: string; description?: string }[];
		}
	>;
};

export async function loadCalendarReference(
	url: URL,
): Promise<CalendarReference | null> {
	if (
		!dev ||
		url.searchParams.get('themePreview') !== 'cip-slender' ||
		url.searchParams.get('cipDemo') !== '1' ||
		!env.THEME_ASSETS_ROOT
	)
		return null;
	try {
		const file = path.join(
			env.THEME_ASSETS_ROOT,
			'cip-slender',
			'reference',
			'event-calendar.json',
		);
		const reference = JSON.parse(
			await fs.readFile(file, 'utf8'),
		) as CalendarReference;
		const validDays = (days: CalendarReference['days']) =>
			days &&
			Object.values(days).every(
				(day) =>
					day &&
					typeof day.hasSeasonalIcon === 'boolean' &&
					(day.seasonalDescription === undefined ||
						typeof day.seasonalDescription === 'string') &&
					Array.isArray(day.events) &&
					day.events.every(
						(event) =>
							event &&
							typeof event.label === 'string' &&
							typeof event.color === 'string' &&
							(event.description === undefined ||
								typeof event.description === 'string'),
					),
			);
		return Array.isArray(reference.months) &&
			reference.months.every(
				(month) => typeof month === 'string' && /^\d{4}-\d{2}$/.test(month),
			) &&
			validDays(reference.days) &&
			(reference.grids === undefined ||
				Object.values(reference.grids).every(validDays))
			? reference
			: null;
	} catch {
		return null;
	}
}
