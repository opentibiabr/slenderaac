import { monthDate, numberParam, referenceDate } from '$lib/server/news/dates';
import { prisma } from '$lib/server/prisma';
import { loadNewsReference } from '$lib/server/theme-assets/news-reference';

import type { PageServerLoad } from './$types';

const TYPE_KEYS = ['ticker', 'article', 'news'] as const;
const CATEGORY_KEYS = [
	'server',
	'community',
	'development',
	'support',
	'technical',
] as const;

export const load = (async ({ url }) => {
	const now = new Date();
	const currentYear = now.getUTCFullYear();
	const today = monthDate(currentYear, now.getUTCMonth() + 1, now.getUTCDate());
	const monthAgo = new Date(today);
	monthAgo.setUTCDate(monthAgo.getUTCDate() - 30);
	const submitted = url.searchParams.get('archive') === '1';
	const form = {
		fromDay: numberParam(
			url.searchParams,
			'filter_begin_day',
			monthAgo.getUTCDate(),
			1,
			31,
		),
		fromMonth: numberParam(
			url.searchParams,
			'filter_begin_month',
			monthAgo.getUTCMonth() + 1,
			1,
			12,
		),
		fromYear: numberParam(
			url.searchParams,
			'filter_begin_year',
			monthAgo.getUTCFullYear(),
			2000,
			currentYear,
		),
		toDay: numberParam(
			url.searchParams,
			'filter_end_day',
			today.getUTCDate(),
			1,
			31,
		),
		toMonth: numberParam(
			url.searchParams,
			'filter_end_month',
			today.getUTCMonth() + 1,
			1,
			12,
		),
		toYear: numberParam(
			url.searchParams,
			'filter_end_year',
			currentYear,
			2000,
			currentYear,
		),
		types: TYPE_KEYS.filter(
			(type) => !submitted || url.searchParams.has(`filter_${type}`),
		),
		categories: CATEGORY_KEYS.filter(
			(category) => !submitted || url.searchParams.has(`filter_${category}`),
		),
	};
	let from = monthDate(form.fromYear, form.fromMonth, form.fromDay);
	let to = monthDate(form.toYear, form.toMonth, form.toDay);
	if (from > to) [from, to] = [to, from];
	Object.assign(form, {
		fromDay: from.getUTCDate(),
		fromMonth: from.getUTCMonth() + 1,
		fromYear: from.getUTCFullYear(),
		toDay: to.getUTCDate(),
		toMonth: to.getUTCMonth() + 1,
		toYear: to.getUTCFullYear(),
	});
	to.setUTCHours(23, 59, 59, 999);
	const reference = await loadNewsReference(url);
	let articles: {
		id: string;
		title: string;
		created_at: Date;
		type: (typeof TYPE_KEYS)[number];
	}[] = [];
	let notice: string | null = null;
	if (submitted && form.types.length && form.categories.length) {
		if (reference) {
			const entries = [
				...reference.articles.map((a) => ({
					id: a.id,
					title: a.title,
					created_at: referenceDate(a.date),
					type: 'news' as const,
					icon: a.icon,
					category: a.category,
				})),
				...reference.ticker.map((a, i) => ({
					id: `classic-ticker-${i}`,
					title: a.text,
					created_at: referenceDate(a.date),
					type: 'ticker' as const,
					icon: a.icon,
					category: a.category,
				})),
			];
			articles = entries
				.filter(
					(a) =>
						form.types.includes(a.type) &&
						form.categories.some((category) =>
							a.category
								? a.category === category
								: a.icon.replaceAll('-', '_').includes(`newsicon_${category}_`),
						) &&
						a.created_at >= from &&
						a.created_at <= to,
				)
				.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
			notice = 'Preview: public Tibia.com news captured for layout comparison.';
		} else {
			articles = await prisma.news.findMany({
				where: {
					published: true,
					type: { in: form.types },
					category: { in: form.categories },
					created_at: { gte: from, lte: to },
				},
				select: { id: true, title: true, created_at: true, type: true },
				orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
				take: 51,
			});
		}
	} else if (submitted) {
		notice = 'Select at least one type and one category.';
	}
	return {
		title: 'News Archive',
		years: Array.from({ length: currentYear - 1999 }, (_, i) => 2000 + i),
		form,
		submitted,
		notice,
		hasMore: articles.length > 50,
		articles: articles.slice(0, 50),
	};
}) satisfies PageServerLoad;
