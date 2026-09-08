import { monthDate, numberParam } from '$lib/server/news/dates';
import { prisma } from '$lib/server/prisma';
import { loadCalendarReference } from '$lib/server/theme-assets/calendar-reference';

import type { PageServerLoad } from './$types';

function monthTarget(year: number, month: number, delta: number) {
	const date = monthDate(year, month + delta);
	return { month: date.getUTCMonth() + 1, year: date.getUTCFullYear() };
}

function berlinTimestamp(date: Date) {
	const time = new Intl.DateTimeFormat('sv-SE', {
		timeZone: 'Europe/Berlin',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	}).format(date);
	const zone =
		new Intl.DateTimeFormat('en-GB', {
			timeZone: 'Europe/Berlin',
			timeZoneName: 'short',
		})
			.formatToParts(date)
			.find((part) => part.type === 'timeZoneName')?.value ?? 'Europe/Berlin';
	return `${time} ${zone}`;
}

export const load = (async ({ url, parent }) => {
	const layout = await parent();
	const palette = layout.cipPresentation?.calendarColors ?? {};
	const now = new Date();
	const currentYear = now.getUTCFullYear();
	const maxYear = currentYear + 1;
	const month = numberParam(
		url.searchParams,
		'calendarmonth',
		now.getUTCMonth() + 1,
		1,
		12,
	);
	const year = numberParam(
		url.searchParams,
		'calendaryear',
		currentYear,
		2000,
		maxYear,
	);
	const first = monthDate(year, month);
	const start = new Date(first);
	start.setUTCDate(1 - ((first.getUTCDay() + 6) % 7));
	const reference = await loadCalendarReference(url);
	const capturedMonth =
		reference?.months.includes(`${year}-${String(month).padStart(2, '0')}`) ??
		false;
	const referenceDays =
		reference?.grids?.[`${year}-${String(month).padStart(2, '0')}`] ??
		reference?.days;
	const today = now.toISOString().slice(0, 10);
	const end = new Date(start);
	end.setUTCDate(start.getUTCDate() + 41);
	const events = reference
		? []
		: await prisma.scheduleEvent.findMany({
				where: {
					published: true,
					starts_at: { lte: end },
					ends_at: { gte: start },
				},
				orderBy: [{ sort_order: 'asc' }, { starts_at: 'asc' }, { id: 'asc' }],
			});
	const cells = Array.from({ length: 42 }, (_, index) => {
		const date = new Date(start);
		date.setUTCDate(start.getUTCDate() + index);
		const isoDate = date.toISOString().slice(0, 10);
		const day = capturedMonth ? referenceDays?.[isoDate] : undefined;
		const scheduled = events.filter(
			(event) => event.starts_at <= date && event.ends_at >= date,
		);
		const seasonal = scheduled.filter((event) => event.seasonal);
		return {
			day: date.getUTCDate(),
			isoDate,
			inMonth: date.getUTCMonth() + 1 === month,
			isToday: isoDate === today,
			hasSeasonalIcon: day?.hasSeasonalIcon ?? seasonal.length > 0,
			seasonalDescription:
				day?.seasonalDescription ??
				seasonal
					.map((event) => `${event.title}: ${event.description}`)
					.join('\n'),
			events: (
				day?.events ??
				scheduled
					.filter((event) => !event.seasonal)
					.map((event) => ({
						label: `${event.starts_at.toISOString().slice(0, 10) === isoDate || event.ends_at.toISOString().slice(0, 10) === isoDate ? '*' : ''}${event.title}`,
						color:
							date.getUTCMonth() + 1 !== month
								? (palette[event.color.toLowerCase()] ?? event.color)
								: event.color,
						description: event.description || event.title,
					}))
			).filter(
				(event) =>
					typeof event.label === 'string' &&
					/^(rgb\(\d{1,3}, \d{1,3}, \d{1,3}\)|#[0-9a-f]{6})$/i.test(
						event.color,
					),
			),
		};
	});
	return {
		title: 'Event Schedule',
		month,
		year,
		monthName: new Intl.DateTimeFormat('en', {
			month: 'long',
			timeZone: 'UTC',
		}).format(first),
		previous: year > 2000 || month > 1 ? monthTarget(year, month, -1) : null,
		next: year < maxYear || month < 12 ? monthTarget(year, month, 1) : null,
		generatedAtLabel: berlinTimestamp(now),
		cells,
		demo: !!reference,
		capturedMonth,
	};
}) satisfies PageServerLoad;
